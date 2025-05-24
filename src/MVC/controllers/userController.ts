import { Request, Response } from "express";

import { User } from "../models/User";

import { helpers } from "../../@node-mongoose-api/src";
const { ResponseJson, handleAsync } = helpers;
export const listUsers = handleAsync(async (req: Request, res: Response) => {
  const users = await User.find().select("-password"); // Fetch users without the password field
  ResponseJson(res, 200, "Users Found", users);
}, "UserList");
