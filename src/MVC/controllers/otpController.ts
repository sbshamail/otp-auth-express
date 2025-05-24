import { NextFunction, Request, Response } from "express";
import { generateOTP, saveOTP, verifyOTP } from "../../utils/otpStore";

import { initWhatsAppClient } from "../../config/whatsappClient";
import { helpers } from "../../@node-mongoose/src";
const { ResponseJson, handleAsync } = helpers;
export const sendOtp = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.otp) {
      return next();
    }
    const client = await initWhatsAppClient();
    const { phone } = req.body;

    if (!phone) {
      ResponseJson(res, 400, "Phone number required");
      return;
    }

    const otp = generateOTP();
    saveOTP(phone, otp);

    const formattedPhone = `${phone}@c.us`;
    await client.sendMessage(formattedPhone, `🔐 Your OTP is: *${otp}*`);
    ResponseJson(res, 200, "OTP sent via WhatsApp");
  },
  "Send OTP",
  500,
  "Failed to send WhatsApp message"
);

export const verifyOtp = handleAsync(
  async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      ResponseJson(res, 400, "Phone and OTP are required");
    }
    const isValid = verifyOTP(phone, otp);
    if (isValid) {
      ResponseJson(res, 200, "OTP verified successfully");
      return;
    } else {
      ResponseJson(res, 401, "Invalid or expired OTP");
      return;
    }
  },
  "Verify OTP",
  401,
  "Invalid or expired OTP"
);
