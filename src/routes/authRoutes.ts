import { Router } from "express";
import { sendOtp } from "../controllers/otpController";
import { register, login } from "../controllers/authController";

const router = Router();

// 🔐 Send OTP as middleware BEFORE register
router.post("/register", sendOtp, register);
router.post("/login", login);

export default router;
