import { Request, Response, NextFunction } from "express";
import { Ride } from "../models/Ride";
import {
  hasHourMin,
  parseToUtcDate,
  validateUtcOrDmyDate,
} from "../../utils/dateFormat";

export const validateArrivalTimeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { arrivalTime } = req.body;

  if (!validateUtcOrDmyDate(arrivalTime)) {
    res.status(400).json({
      success: false,
      message: "arrivalTime must be in UTC (ISO 8601) or dd-mm-yyyy format",
    });
    return;
  }
  if (!hasHourMin(arrivalTime)) {
    res.status(400).json({
      success: false,
      message: "arrivalTime must include hour and minute (e.g. 14:30)",
    });
    return;
  }
  const parsed = parseToUtcDate(arrivalTime);
  if (!parsed) {
    res.status(400).json({
      success: false,
      message: "Invalid date format for arrivalTime",
    });
    return;
  }

  // Inject parsed date into req.body for controller to use
  req.body.arrivalTime = parsed;
  next();
};
export const createRide = async (req: Request, res: Response) => {
  try {
    const { arrivalTime, ...rest } = req.body;

    const ride = new Ride({
      ...rest,
      arrivalTime, // already parsed in middleware
      UserId: req.user.id,
    });

    await ride.save();
    res.status(201).json({ success: true, message: "Ride created", ride });
  } catch (error) {
    console.error("Error creating ride:", error);
    res.status(500).json({ success: false, message: "Failed to create ride" });
  }
};

export const updateRide = async (req: Request, res: Response) => {
  try {
    const ride = await Ride.findOne({
      _id: req.params.id,
      UserId: req.user.id,
    });

    if (!ride) {
      res
        .status(404)
        .json({ success: false, message: "Ride not found or unauthorized" });
      return;
    }

    // Apply updates
    Object.assign(ride, req.body);

    await ride.save();

    res.json({ success: true, message: "Ride updated successfully", ride });
  } catch (error) {
    console.error("Error updating ride:", error);
    res.status(500).json({ success: false, message: "Failed to update ride" });
  }
};

export const getAllRides = async (req: Request, res: Response) => {
  try {
    const rides = await Ride.find()
      .populate("UserId", "-password -__v")
      .sort({ createdAt: -1 });

    res.json({ success: true, rides });
  } catch (error) {
    console.error("Error fetching rides:", error);
    res.status(500).json({ success: false, message: "Failed to fetch rides" });
  }
};

export const getRideById = async (req: Request, res: Response) => {
  try {
    const ride = await Ride.findById(req.params.id).populate(
      "UserId",
      "-password -__v"
    );

    if (!ride) {
      res.status(404).json({ success: false, message: "Ride not found" });
      return;
    }

    res.json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch ride" });
  }
};

export const deleteRide = async (req: Request, res: Response) => {
  try {
    const ride = await Ride.findOneAndDelete({
      _id: req.params.id,
      UserId: req.user.id,
    });

    if (!ride) {
      res
        .status(404)
        .json({ success: false, message: "Ride not found or unauthorized" });
      return;
    }

    res.json({ success: true, message: "Ride deleted" });
  } catch (error) {
    console.error("Error deleting ride:", error);
    res.status(500).json({ success: false, message: "Failed to delete ride" });
  }
};
