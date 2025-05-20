import { Request, RequestHandler, Response } from "express";
import { verifyOTP } from "../utils/otpStore";
import { User } from "../models/User";
import { hashPassword } from "../utils/hash";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../../config";
// ✅ WhatsApp client (already initialized elsewhere)

export const register = async (req: Request, res: Response): Promise<void> => {
  const { phone, otp, password, fullName, cnic, address, photoUrl } = req.body;

  if (!verifyOTP(phone, otp)) {
    res.status(401).json({ error: "Invalid or expired OTP" });
    return;
  }

  const existing = await User.findOne({ phone });
  if (existing) {
    res.status(400).json({ error: "Phone already registered" });
    return;
  }

  const hashedPassword = await hashPassword(password);

  const newUser = new User({
    phone,
    password: hashedPassword,
    fullName,
    cnic,
    address,
    photoUrl,
    status: "active",
  });

  try {
    await newUser.save();
    res
      .status(201)
      .json({ success: true, message: "Account registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    res
      .status(400)
      .json({ success: false, message: "Phone and password are required." });
    return;
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    if (user.status !== "active") {
      res
        .status(403)
        .json({ success: false, message: "Account is not active." });
      return;
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
