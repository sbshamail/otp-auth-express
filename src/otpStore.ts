// src/otpStore.ts

type OTPData = {
  otp: string;
  createdAt: number;
};

const otpMap = new Map<string, OTPData>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function saveOTP(phone: string, otp: string): void {
  otpMap.set(phone, { otp, createdAt: Date.now() });
}

export function verifyOTP(phone: string, inputOtp: string): boolean {
  const data = otpMap.get(phone);
  if (!data) return false;

  const isExpired = Date.now() - data.createdAt > 5 * 60 * 1000; // 5 minutes
  const isValid = data.otp === inputOtp && !isExpired;

  if (isValid) otpMap.delete(phone);
  return isValid;
}
