import { Router } from "express";
import { register } from "../controllers/authController";
import { sendOtp } from "../controllers/otpController";

const router = Router();

// 🔐 Send OTP as middleware BEFORE register
router.post("/register", register);

export default router;
