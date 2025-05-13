import { Router } from "express";
import { sendOtp, verifyOtp } from "../controllers/otpController";

const router = Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;
