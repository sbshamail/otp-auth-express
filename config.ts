import dotenv from "dotenv";

dotenv.config();
export const JWT_SECRET = process.env.JWT_SECRET as string;

export const PORT = process.env.PORT || 3000;
export const db = (process.env.DB as string) || "";
