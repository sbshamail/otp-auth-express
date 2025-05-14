import { Router } from "express";

import { requireSignIn, isAdmin } from "../middleware/auth";
import { listUsers } from "../controllers/userController";

const router = Router();

router.post("/list", requireSignIn, isAdmin, listUsers);

export default router;
