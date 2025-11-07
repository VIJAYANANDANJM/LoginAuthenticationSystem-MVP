import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Check if email is configured
const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;

// Create transporter only if email is configured
let transporter = null;
if (hasEmailConfig) {
  try {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password for Gmail
      },
    });
    console.log("✅ Email service configured");
  } catch (error) {
    console.error("❌ Email transporter creation error:", error.message);
  }
} else {
  console.log("⚠️  Email not configured - emails will be logged to console");
}

export const sendEmail = async (to, subject, html, text = "") => {
  try {
    // If email not configured, log to console
    if (!hasEmailConfig || !transporter) {
      console.log("\n" + "=".repeat(60));
      console.log("📧 EMAIL (Development Mode - Not Sent)");
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
      return { success: true, message: "Email logged (development mode)" };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@loginauth.com",
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending error:", error.message);
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

