import dotenv from "dotenv";

dotenv.config();

/**
 * Email Service (Brevo API Only)
 * ---------------------------------
 * Works entirely via HTTPS (no SMTP ports)
 * Perfect for Render and cloud deployments.
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// Validate configuration
if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
  console.warn("⚠️  Brevo Email not fully configured!");
  console.warn("💡 Set BREVO_API_KEY and EMAIL_FROM in environment variables.");
} else {
  console.log("📧 Brevo API Email Service Ready");
}

/**
 * Sends an email using Brevo API.
 * 
 * @param {string} to - Recipient email address
 * @param {string} subject - Subject of the email
 * @param {string} html - HTML content of the email
 * @param {string} [text] - Optional plain text content
 */
export const sendEmail = async (to, subject, html, text = "") => {
  try {
    const brevoApiKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.EMAIL_FROM;
    const fromName = process.env.EMAIL_FROM_NAME || "Login Authentication System";

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text || html.replace(/<[^>]*>/g, ""),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown Brevo API error" }));
      throw new Error(errorData.message || `Brevo API error: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Email sent successfully to ${to} (messageId: ${result.messageId || "N/A"})`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Email sending error:", error.message);
    console.log("💡 The email content is logged below for manual testing.\n");
    console.log("=".repeat(60));
    console.log("📧 EMAIL (Fallback - Email sending failed)");
    console.log("=".repeat(60));
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("HTML Content:\n", html);
    console.log("=".repeat(60));
    return { success: false, error: error.message };
  }
};

/**
 * Sends a verification email with clickable link.
 */
export const sendVerificationEmail = async (email, token) => {
  // Use backend API endpoint for verification (verifies and redirects to frontend)
  // Try multiple sources for backend URL (same logic as server.js)
  let backendUrl = process.env.BACKEND_URL || 
                   process.env.API_URL || 
                   process.env.RENDER_EXTERNAL_URL || 
                   (process.env.NODE_ENV === "production" ? "https://loginauthenticationsystem-mvp.onrender.com" : "http://localhost:5000");
  
  // Remove trailing slash
  backendUrl = backendUrl.replace(/\/$/, "");
  
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  const verificationUrl = `${backendUrl}/api/auth/verify-email?token=${token}&redirect=${encodeURIComponent(frontendUrl)}`;
  
  // Log for debugging
  if (!process.env.BACKEND_URL) {
    console.log("⚠️  BACKEND_URL not set, using fallback:", backendUrl);
  }
  const subject = "Verify Your Email Address";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0288d1;">Email Verification</h2>
      <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
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

/**
 * Sends a password reset email.
 */
export const sendPasswordResetEmail = async (email, token) => {
  // Use backend API endpoint for password reset (redirects to frontend)
  // Try multiple sources for backend URL (same logic as server.js)
  let backendUrl = process.env.BACKEND_URL || 
                   process.env.API_URL || 
                   process.env.RENDER_EXTERNAL_URL || 
                   (process.env.NODE_ENV === "production" ? "https://loginauthenticationsystem-mvp.onrender.com" : "http://localhost:5000");
  
  // Remove trailing slash
  backendUrl = backendUrl.replace(/\/$/, "");
  
  // Get frontend URL and ensure it's valid
  let frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  frontendUrl = frontendUrl.replace(/\/$/, "");
  
  // Validate frontend URL is a proper URL
  try {
    new URL(frontendUrl);
  } catch (e) {
    console.error("❌ Invalid FRONTEND_URL environment variable:", frontendUrl);
    frontendUrl = "http://localhost:5173"; // Fallback to default
  }
  
  // Construct the reset URL with proper encoding
  const resetUrl = `${backendUrl}/api/auth/reset-password?token=${token}&redirect=${encodeURIComponent(frontendUrl)}`;
  
  // Log for debugging
  if (!process.env.BACKEND_URL) {
    console.log("⚠️  BACKEND_URL not set, using fallback:", backendUrl);
  }
  if (!process.env.FRONTEND_URL) {
    console.log("⚠️  FRONTEND_URL not set, using fallback:", frontendUrl);
  }
  
  console.log("🔗 Password reset URL constructed:", resetUrl);
  
  const subject = "Reset Your Password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0288d1;">Password Reset Request</h2>
      <p>You requested to reset your password. Click the button below to create a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0288d1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Reset Password
      </a>
      <p>If you didn't request this, please ignore this email.</p>
      <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
      <p style="color: #666; font-size: 11px; word-break: break-all;">Or copy this link: ${resetUrl}</p>
    </div>
  `;
  return sendEmail(email, subject, html);
};

/**
 * Sends a one-time password (OTP) email.
 */
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
      <p>If you didn’t request this code, please ignore this email.</p>
    </div>
  `;
  return sendEmail(email, subject, html);
};
