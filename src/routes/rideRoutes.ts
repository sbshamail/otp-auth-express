import { Router } from "express";

import { requireSignIn, isAdmin } from "../middleware/auth";
import {
  validateArrivalTimeMiddleware,
  createRide,
  deleteRide,
  getAllRides,
  getRideById,
  updateRide,
} from "../controllers/rideController";

const router = Router();

router.post(
  "/create",
  requireSignIn,
  validateArrivalTimeMiddleware,
  createRide
);
router.post("/update", requireSignIn, updateRide);
router.post("/read", requireSignIn, getRideById);
router.post("/delete", requireSignIn, deleteRide);
router.post("/list", requireSignIn, getAllRides);

export default router;
