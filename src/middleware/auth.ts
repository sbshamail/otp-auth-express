// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { helpers } from "../@node-mongoose-api/src";
const { ResponseJson } = helpers;
export type JwtUserPayload = {
  id: string;
  role: string;
};
export const requireSignIn = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    ResponseJson(res, 401, "Unauthorized");

    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    ResponseJson(res, 403, "Invalid token");
    return;
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "1") {
    ResponseJson(res, 403, "Access denied. Admins only.");
    return;
  }
  next();
};
