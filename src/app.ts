import express from "express";
import dotenv from "dotenv";
import otpRoutes from "./routes/otpRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import morgan from "morgan";

dotenv.config();

const app = express();
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", otpRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello from Express + TypeScript + MongoDB");
});

export default app;
