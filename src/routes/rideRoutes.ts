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
router.get("/read/:id", getRideById);
router.delete("/delete/:id", requireSignIn, deleteRide);
router.get("/list", getAllRides);

export default router;
