import { Router } from "express";

import { requireSignIn, isAdmin } from "../../middleware/auth";
import {
  createRide,
  deleteRide,
  getAllRides,
  getRideById,
  updateRide,
  getRidesByUserId,
} from "../controllers/rideController/rideController";
import { validateArrivalTimeMiddleware } from "../controllers/rideController/fn";

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
router.get("/listByUser", requireSignIn, getRidesByUserId);

export default router;
