import { Request, Response, NextFunction } from "express";
import { Ride } from "../models/Ride";
import {
  hasHourMin,
  parseToUtcDate,
  validateUtcOrDmyDate,
} from "../../utils/dateFormat";
import { helpers } from "../../@node-mongoose-api/src";
const { ResponseJson, handleAsync } = helpers;

export const validateArrivalTimeMiddleware = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
  }
);
export const createRide = handleAsync(async (req: Request, res: Response) => {
  const { arrivalTime, ...rest } = req.body;

  const ride = new Ride({
    ...rest,
    arrivalTime, // already parsed in middleware
    UserId: req.user.id,
  });

  await ride.save();
  ResponseJson(res, 201, "Ride created", ride);
}, "Ride");

export const updateRide = handleAsync(async (req: Request, res: Response) => {
  const ride = await Ride.findOne({
    _id: req.params.id,
    UserId: req.user.id,
  });

  if (!ride) {
    ResponseJson(res, 404, "Ride not found or unauthorized");
    return;
  }

  // Apply updates
  Object.assign(ride, req.body);

  await ride.save();
  ResponseJson(res, 200, "Ride updated successfully", ride);
}, "Ride Update");

export const getAllRides = handleAsync(async (req: Request, res: Response) => {
  const rides = await Ride.find()
    .populate("UserId", "-password -__v")
    .sort({ createdAt: -1 });
  ResponseJson(res, 200, "Ride Found", rides);
  res.json({ success: true, rides });
}, "Ride Find");

export const getRideById = handleAsync(async (req: Request, res: Response) => {
  const ride = await Ride.findById(req.params.id).populate(
    "UserId",
    "-password -__v"
  );

  if (!ride) {
    ResponseJson(res, 404, "Ride not found");
    return;
  }
  ResponseJson(res, 200, "Ride found", ride);
}, "Ride Find");

export const deleteRide = handleAsync(async (req: Request, res: Response) => {
  const ride = await Ride.findOneAndDelete({
    _id: req.params.id,
    UserId: req.user.id,
  });

  if (!ride) {
    ResponseJson(res, 404, "Ride not found or unauthorized");
    return;
  }
  ResponseJson(res, 200, "Ride deleted");
}, "Ride Delete");
