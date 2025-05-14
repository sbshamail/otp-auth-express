import { Request, Response } from "express";

import { User } from "../models/User";

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password"); // Fetch users without the password field
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("❌ Error fetching users:", error); // Log the error for debugging

    res.status(500).json({ success: false, message: "Internal Server Error" }); // Send a 500 status if an error occurs
  }
};
