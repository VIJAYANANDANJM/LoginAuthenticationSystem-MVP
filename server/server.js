// ====== server.js ======
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import speakeasy from "speakeasy";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
} from "./utils/emailService.js";
import crypto from "crypto";

// ====== Configuration ======
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ====== Middleware ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173",
  "https://login-authentication-system-mvp.vercel.app",
];

// ✅ Apply CORS before any routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigins.includes(req.headers.origin) ? req.headers.origin : "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // ✅ Handle preflight requests quickly
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Passport middleware
app.use(passport.initialize());

// ====== MongoDB Connection ======
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/loginMVP", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ====== User Model ======
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth users
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  googleId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// ====== Passport Google OAuth Strategy ======
// Only initialize if Google OAuth credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            return done(null, user);
          }
          // Check if user exists with same email
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.googleId = profile.id;
            user.isVerified = true; // Google emails are verified
            await user.save();
            return done(null, user);
          }
          // Create new user
          user = new User({
            email: profile.emails[0].value,
            googleId: profile.id,
            isVerified: true,
          });
          await user.save();
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  console.log("✅ Google OAuth configured");
} else {
  console.log("⚠️  Google OAuth not configured - Google login will be disabled");
}

// ====== Register API ======
app.post("/api/auth/register", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = new User({
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiry,
      isVerified: false,
    });
    await newUser.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken);
    
    // Always log verification link (especially if email failed)
    // Try multiple sources for backend URL
    let backendUrl = process.env.BACKEND_URL || 
                     process.env.API_URL || 
                     process.env.RENDER_EXTERNAL_URL || 
                     (process.env.NODE_ENV === "production" ? "https://loginauthenticationsystem-mvp.onrender.com" : "http://localhost:5000");
    
    // Remove trailing slash
    backendUrl = backendUrl.replace(/\/$/, "");
    
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const verificationUrl = `${backendUrl}/api/auth/verify-email?token=${verificationToken}&redirect=${encodeURIComponent(frontendUrl)}`;
    
    // Log for debugging
    console.log("🔗 Generated verification URL:", verificationUrl);
    
    if (!emailResult.success || !process.env.BREVO_API_KEY) {
      console.log("\n" + "=".repeat(60));
      console.log("🔗 VERIFICATION LINK (Copy this if email failed):");
      console.log(verificationUrl);
      console.log("=".repeat(60) + "\n");
    }

    res.status(201).json({
      message: "✅ Registration successful! Please check your email to verify your account.",
      ...(process.env.NODE_ENV === "development" && !process.env.EMAIL_USER && {
        devVerificationLink: verificationUrl,
      }),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists." });
    }
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "Server error during registration.", detail: error.message });
  }
});

// ====== Verify Email API ======
app.get("/api/auth/verify-email", async (req, res) => {
  try {
    const { token, redirect } = req.query;
    const frontendUrl = redirect || process.env.FRONTEND_URL || "http://localhost:5173";
    const baseUrl = frontendUrl.replace(/\/$/, "");

    if (!token) {
      // Redirect to frontend with error
      return res.redirect(`${baseUrl}/?error=verification_failed&message=${encodeURIComponent("Verification token is required.")}`);
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      // Redirect to frontend with error
      return res.redirect(`${baseUrl}/?error=verification_failed&message=${encodeURIComponent("Invalid or expired verification token.")}`);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Redirect to frontend with success message
    res.redirect(`${baseUrl}/?verified=true&message=${encodeURIComponent("Email verified successfully! You can now log in.")}`);
  } catch (error) {
    console.error("❌ Email Verification Error:", error);
    const frontendUrl = req.query.redirect || process.env.FRONTEND_URL || "http://localhost:5173";
    const baseUrl = frontendUrl.replace(/\/$/, "");
    res.redirect(`${baseUrl}/?error=verification_failed&message=${encodeURIComponent("Server error during verification.")}`);
  }
});

// ====== Resend Verification Email API ======
app.post("/api/auth/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({ message: "✅ Verification email sent!" });
  } catch (error) {
    console.error("❌ Resend Verification Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// ====== Forgot Password API ======
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });

    if (!user) {
      // Don't reveal if user exists for security
      return res.status(200).json({
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const emailResult = await sendPasswordResetEmail(user.email, resetToken);
    
    // Always log reset link (especially if email failed)
    // Try multiple sources for backend URL
    let backendUrl = process.env.BACKEND_URL || 
                     process.env.API_URL || 
                     process.env.RENDER_EXTERNAL_URL || 
                     (process.env.NODE_ENV === "production" ? "https://loginauthenticationsystem-mvp.onrender.com" : "http://localhost:5000");
    
    // Remove trailing slash
    backendUrl = backendUrl.replace(/\/$/, "");
    
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const resetUrl = `${backendUrl}/api/auth/reset-password?token=${resetToken}&redirect=${encodeURIComponent(frontendUrl)}`;
    
    // Log for debugging
    console.log("🔗 Generated reset URL:", resetUrl);
    
    if (!emailResult.success || !process.env.BREVO_API_KEY) {
      console.log("\n" + "=".repeat(60));
      console.log("🔗 PASSWORD RESET LINK (Copy this if email failed):");
      console.log(resetUrl);
      console.log("=".repeat(60) + "\n");
    }

    res.status(200).json({
      message: "If an account exists with this email, a password reset link has been sent.",
      ...(process.env.NODE_ENV === "development" && !process.env.EMAIL_USER && {
        devResetLink: resetUrl,
      }),
    });
  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// ====== Reset Password API ======
// GET endpoint - shows reset password form or redirects
app.get("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, redirect } = req.query;
    const frontendUrl = redirect || process.env.FRONTEND_URL || "http://localhost:5173";
    const baseUrl = frontendUrl.replace(/\/$/, "");

    if (!token) {
      return res.redirect(`${baseUrl}/?error=reset_failed&message=${encodeURIComponent("Reset token is required.")}`);
    }

    // Verify token is valid
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.redirect(`${baseUrl}/?error=reset_failed&message=${encodeURIComponent("Invalid or expired reset token.")}`);
    }

    // Redirect to frontend reset password page with token
    res.redirect(`${baseUrl}/reset-password?token=${token}`);
  } catch (error) {
    console.error("❌ Reset Password GET Error:", error);
    const frontendUrl = req.query.redirect || process.env.FRONTEND_URL || "http://localhost:5173";
    const baseUrl = frontendUrl.replace(/\/$/, "");
    res.redirect(`${baseUrl}/?error=reset_failed&message=${encodeURIComponent("Server error.")}`);
  }
});

// POST endpoint - actually resets the password
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required." });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "✅ Password reset successfully!" });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// ====== Login API ======
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const emailLower = email?.trim().toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Check if email is verified (only for non-OAuth users)
    if (!user.isVerified && user.password) {
      return res.status(400).json({
        message: "Please verify your email before logging in.",
        requiresVerification: true,
      });
    }

    // Check password (skip for OAuth-only users)
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password." });
      }
    } else {
      return res.status(400).json({ message: "Please use Google sign-in for this account." });
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!otp) {
        // Generate and send OTP
        const otpCode = speakeasy.totp({
          secret: user.twoFactorSecret,
          encoding: "base32",
        });
        await sendOTPEmail(user.email, otpCode);
        return res.status(200).json({
          requires2FA: true,
          message: "2FA code sent to your email. Please enter the code.",
        });
      }

      // Verify OTP
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: otp,
        window: 2, // Allow 2 time steps (60 seconds each)
      });

      if (!isValid) {
        return res.status(400).json({ message: "Invalid 2FA code." });
      }
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "✅ Login successful", token });
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ message: "Server error during login." });
  }
});

// ====== Enable 2FA API ======
app.post("/api/auth/enable-2fa", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided." });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found." });

    const secret = speakeasy.generateSecret({
      name: `LoginAuth (${user.email})`,
    });

    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url,
      message: "✅ 2FA enabled successfully!",
    });
  } catch (error) {
    console.error("❌ Enable 2FA Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// ====== Disable 2FA API ======
app.post("/api/auth/disable-2fa", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided." });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found." });

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.status(200).json({ message: "✅ 2FA disabled successfully!" });
  } catch (error) {
    console.error("❌ Disable 2FA Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// ====== Google OAuth Routes ======
// Only enable if Google OAuth is configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { session: false }),
    async (req, res) => {
      try {
        const user = req.user;
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", {
          expiresIn: "1h",
        });
        // Redirect to frontend with token
        res.redirect(
          `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard?token=${token}`
        );
      } catch (error) {
        res.redirect(
          `${process.env.FRONTEND_URL || "http://localhost:5173"}/?error=oauth_failed`
        );
      }
    }
  );
} else {
  // Return error if OAuth is not configured
  app.get("/api/auth/google", (req, res) => {
    res.status(503).json({ message: "Google OAuth is not configured." });
  });
  
  app.get("/api/auth/google/callback", (req, res) => {
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/?error=oauth_not_configured`
    );
  });
}

// ====== Protected Profile API ======
app.get("/api/auth/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided." });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const user = await User.findById(decoded.id).select("-password -twoFactorSecret");
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Token Validation Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token." });
  }
});

// ====== Default Route ======
app.get("/", (req, res) => {
  res.send("🚀 Login Authentication API is running successfully!");
});

// ====== Start Server ======
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
