import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Check if email is configured
// Support both traditional (EMAIL_USER/EMAIL_PASS) and API-based services
const hasEmailConfig = (process.env.EMAIL_USER && process.env.EMAIL_PASS) || 
                       (process.env.EMAIL_API_KEY && process.env.EMAIL_FROM);

// Create transporter only if email is configured
let transporter = null;
let emailVerified = false;

if (hasEmailConfig) {
  try {
    const emailService = process.env.EMAIL_SERVICE?.toLowerCase() || "gmail";
    
    // Configure transporter based on service type
    let transporterConfig = {
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      pool: true,
      maxConnections: 1,
    };

    // If EMAIL_HOST is provided, use custom SMTP configuration
    // This works for SendGrid, Mailgun, Brevo, and other SMTP services
    if (process.env.EMAIL_HOST) {
      transporterConfig = {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS || process.env.EMAIL_API_KEY,
        },
        ...transporterConfig,
      };
      console.log(`📧 Using SMTP: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
    }
    // SendGrid configuration (if service is specified but no host)
    else if (emailService === "sendgrid") {
      transporterConfig = {
        host: "smtp.sendgrid.net",
        port: 587,
        secure: false,
        auth: {
          user: "apikey",
          pass: process.env.EMAIL_PASS || process.env.EMAIL_API_KEY,
        },
        ...transporterConfig,
      };
      console.log("📧 Using SendGrid SMTP");
    }
    // Mailgun configuration
    else if (emailService === "mailgun") {
      transporterConfig = {
        host: "smtp.mailgun.org",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        ...transporterConfig,
      };
      console.log("📧 Using Mailgun SMTP");
    }
    // Brevo (Sendinblue) configuration
    else if (emailService === "brevo" || emailService === "sendinblue") {
      transporterConfig = {
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        ...transporterConfig,
      };
      console.log("📧 Using Brevo SMTP");
    }
    // Gmail or default
    else {
      transporterConfig = {
        service: emailService,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        ...transporterConfig,
        secure: true,
        tls: {
          rejectUnauthorized: false,
        },
      };
    }

    transporter = nodemailer.createTransport(transporterConfig);
    
    console.log("📧 Email transporter created");
    console.log("⏳ Verifying email connection (non-blocking)...");
    
    // Verify connection asynchronously (non-blocking)
    // This allows server to start even if email verification fails
    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ Email service verification failed:", error.message);
        console.log("⚠️  Emails will be logged to console instead");
        console.log("💡 Tip: Check EMAIL_USER and EMAIL_PASS in environment variables");
        emailVerified = false;
        // Don't set transporter to null - we'll try to use it anyway
        // Some cloud providers block verification but allow actual sending
      } else {
        console.log("✅ Email service verified successfully");
        emailVerified = true;
      }
    });
    
    // Set a timeout for verification (don't wait forever)
    setTimeout(() => {
      if (!emailVerified) {
        console.log("⏱️  Email verification timeout - will attempt to send emails anyway");
        console.log("⚠️  If emails fail, they will be logged to console");
      }
    }, 6000);
    
  } catch (error) {
    console.error("❌ Email transporter creation error:", error.message);
    console.log("⚠️  Emails will be logged to console instead");
    transporter = null;
  }
} else {
  console.log("⚠️  Email not configured - emails will be logged to console");
  console.log("💡 Set EMAIL_USER and EMAIL_PASS environment variables to enable email");
}

export const sendEmail = async (to, subject, html, text = "") => {
  try {
    // If email not configured, log to console
    if (!hasEmailConfig || !transporter) {
      console.log("\n" + "=".repeat(60));
      console.log("📧 EMAIL (Not Sent - Logged to Console)");
      console.log("=".repeat(60));
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log("\n--- HTML Content ---");
      console.log(html);
      if (text) {
        console.log("\n--- Text Content ---");
        console.log(text);
      }
      console.log("=".repeat(60) + "\n");
      return { success: false, message: "Email logged (not sent - not configured)" };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@loginauth.com",
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    };

    // Try to send email with shorter timeout for cloud environments
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Email send timeout after 10 seconds")), 10000)
    );

    try {
      const info = await Promise.race([sendPromise, timeoutPromise]);
      console.log("✅ Email sent successfully:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (sendError) {
      // If send fails, log to console
      throw sendError;
    }
  } catch (error) {
    console.error("❌ Email sending error:", error.message);
    console.log("💡 This is common on Render - emails are logged below for manual use");
    
    // Fallback to console logging if email fails
    console.log("\n" + "=".repeat(60));
    console.log("📧 EMAIL (Fallback - Email sending failed)");
    console.log("=".repeat(60));
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("\n--- Content ---");
    console.log(html);
    console.log("=".repeat(60) + "\n");
    return { success: false, error: error.message };
  }
};

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}`;
  const subject = "Verify Your Email Address";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0288d1;">Email Verification</h2>
      <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0288d1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Verify Email
      </a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
      <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
    </div>
  `;
  return sendEmail(email, subject, html);
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;
  const subject = "Reset Your Password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0288d1;">Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to create a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0288d1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Reset Password
      </a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #666; word-break: break-all;">${resetUrl}</p>
      <p style="color: #999; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail(email, subject, html);
};

export const sendOTPEmail = async (email, otp) => {
  const subject = "Your Two-Factor Authentication Code";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0288d1;">Two-Factor Authentication</h2>
      <p>Your verification code is:</p>
      <div style="font-size: 32px; font-weight: bold; color: #0288d1; text-align: center; margin: 20px 0; letter-spacing: 8px;">
        ${otp}
      </div>
      <p style="color: #999; font-size: 12px;">This code will expire in 10 minutes.</p>
      <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
    </div>
  `;
  return sendEmail(email, subject, html);
};

