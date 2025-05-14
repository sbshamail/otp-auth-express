import { Request, Response } from "express";
import { generateOTP, saveOTP, verifyOTP } from "../utils/otpStore";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const client = new Client({
  // authStrategy: new LocalAuth({ clientId: "myapp" }),
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});
client.on("loading_screen", (percent, message) => {
  console.log(`Loading: ${percent}% - ${message}`);
});

client.on("authenticated", () => {
  console.log("✅ Authenticated with WhatsApp");
});

client.on("auth_failure", (msg) => {
  console.error("❌ Authentication failure:", msg);
});

client.on("disconnected", (reason) => {
  console.warn("⚠️ Client disconnected:", reason);
});

client.on("qr", (qr: string) => {
  console.log("Scan this QR code with WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp client is ready!");
});

client.initialize();

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
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
