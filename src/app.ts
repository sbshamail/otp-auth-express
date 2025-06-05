import express, { Request, Response } from "express";

import otpRoutes from "./MVC/routes/otpRoutes";
import authRoutes from "./MVC/routes/authRoutes";
import userRoutes from "./MVC/routes/userRoutes";
import rideRoutes from "./MVC/routes/rideRoutes";
import morgan from "morgan";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", otpRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ride", rideRoutes);

app.get("/api", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript + MongoDB");
});

export default app;
