// src/server.ts

import express, { Request, RequestHandler, Response } from "express";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { generateOTP, saveOTP, verifyOTP } from "./otpStore";

const app = express();
app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr: string) => {
  console.log("Scan this QR code with WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp client is ready!");
});

client.initialize();

app.post("/send-otp", async (req: Request, res: Response): Promise<void> => {
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
});
// // POST /verify-otp
app.post("/verify-otp", (req: Request, res: Response) => {
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
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
