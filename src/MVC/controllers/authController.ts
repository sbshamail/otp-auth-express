import { Request, Response } from "express";
import { verifyOTP } from "../../utils/otpStore";
import { User } from "../models/User";
import { hashPassword } from "../../utils/hash";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../../config";
import { helpers } from "../../@node-mongoose/src";
const { handleAsync, ResponseJson } = helpers;

export const register = handleAsync(async (req: Request, res: Response) => {
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

  await newUser.save();
  ResponseJson(res, 201, "Account registered successfully");
}, "User Register");

export const login = handleAsync(async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    ResponseJson(res, 400, "Phone and password are required");

    return;
  }

  const user = await User.findOne({ phone });
  if (!user) {
    ResponseJson(res, 404, "User not found");
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    ResponseJson(res, 401, "Invalid credentials");
    return;
  }

  if (user.status !== "active") {
    ResponseJson(res, 403, "Account is not active");
    return;
  }

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });
  const data = {
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
  };
  ResponseJson(res, 200, "Login successful", data);
}, "User Login");
