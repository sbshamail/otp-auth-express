import { NextFunction, Request, Response } from "express";
import { generateOTP, saveOTP, verifyOTP } from "../utils/otpStore";

import { initWhatsAppClient } from "../config/whatsappClient";

export const sendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.body.otp) {
    return next();
  }
  const client = await initWhatsAppClient();
  const { phone } = req.body;

  if (!phone) {
    res.status(400).json({ error: "Phone number required" });
    return;
  }

  const otp = generateOTP();
  saveOTP(phone, otp);

  const formattedPhone = `${phone}@c.us`;

  try {
    await client.sendMessage(formattedPhone, `🔐 Your OTP is: *${otp}*`);
    res.json({ success: true, message: "OTP sent via WhatsApp" });
  } catch (err) {
    console.error("❌ Failed to send WhatsApp message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    res.status(400).json({ error: "Phone and OTP are required" });
  }
  const isValid = verifyOTP(phone, otp);
  if (isValid) {
    res.json({ success: true, message: "OTP verified successfully" });
  } else {
    res.status(401).json({ success: false, message: "Invalid or expired OTP" });
  }
};
