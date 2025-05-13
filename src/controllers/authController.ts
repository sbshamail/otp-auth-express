import { Request, Response } from "express";
import { generateOTP, saveOTP, verifyOTP } from "../utils/otpStore";
import { User } from "../models/User";
import { hashPassword } from "../utils/hash";
import { Client } from "whatsapp-web.js";

// ✅ WhatsApp client (already initialized elsewhere)

export const register = async (req: Request, res: Response): Promise<void> => {
  const { phone, otp, password, fullName, cnic, address, photoUrl } = req.body;
  console.log(req.body);
  // if (!verifyOTP(phone, otp)) {
  //   res.status(401).json({ error: "Invalid or expired OTP" });
  //   return;
  // }

  // const existing = await User.findOne({ phone });
  // if (existing) {
  //   res.status(400).json({ error: "Phone already registered" });
  //   return;
  // }

  // const hashedPassword = await hashPassword(password);

  // const newUser = new User({
  //   phone,
  //   password: hashedPassword,
  //   fullName,
  //   cnic,
  //   address,
  //   photoUrl,
  //   status: "active",
  // });

  // try {
  //   await newUser.save();
  //   res
  //     .status(201)
  //     .json({ success: true, message: "Account registered successfully" });
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).json({ error: "Registration failed" });
  // }
};
