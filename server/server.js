// ====== server.js ======
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ====== Configuration ======
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ====== Middleware ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Allow React frontend to access backend
app.use(
  cors({
    origin: true, // reflect request origin
    credentials: true,
  })
);

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
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

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
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "✅ User registered successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists." });
    }
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "Server error during registration.", detail: error.message });
  }
});

// ====== Login API ======
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password." });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password." });

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

// ====== Protected Profile API ======
app.get("/api/auth/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided." });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const user = await User.findById(decoded.id).select("-password");
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
