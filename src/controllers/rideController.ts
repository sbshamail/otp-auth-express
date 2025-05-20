import { Request, Response, NextFunction } from "express";
import { Ride } from "../models/Ride";
import { parseToUtcDate, validateUtcOrDmyDate } from "../utils/dateFormat";

export const validateArrivalTimeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { arrivalTime } = req.body;

  if (!validateUtcOrDmyDate(arrivalTime)) {
    return res.status(400).json({
      success: false,
      message: "arrivalTime must be in UTC (ISO 8601) or dd-mm-yyyy format",
    });
  }

  const parsed = parseToUtcDate(arrivalTime);
  if (!parsed) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format for arrivalTime",
    });
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
      userId: req.user._id,
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
      userId: req.user._id,
    });

    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found or unauthorized" });
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
      .populate("userId", "-password -__v")
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
      "userId",
      "-password -__v"
    );

    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    res.json({ success: true, ride });
  } catch (error) {
    console.error("Error fetching ride:", error);
    res.status(500).json({ success: false, message: "Failed to fetch ride" });
  }
};

export const deleteRide = async (req: Request, res: Response) => {
  try {
    const ride = await Ride.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found or unauthorized" });
    }

    res.json({ success: true, message: "Ride deleted" });
  } catch (error) {
    console.error("Error deleting ride:", error);
    res.status(500).json({ success: false, message: "Failed to delete ride" });
  }
};
