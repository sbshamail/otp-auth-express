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
  const { arrivalTime, from, to, ...rest } = req.body;
  const fromCoordinates = [Number(from.longitude), Number(from.latitude)]; // longitude first!
  const toCoordinates = [Number(to.longitude), Number(to.latitude)];

  console.log(req.body);
  const ride = new Ride({
    ...rest,
    arrivalTime, // already parsed in middleware
    from: {
      type: "Point",
      coordinates: fromCoordinates,
    },
    to: {
      type: "Point",
      coordinates: toCoordinates,
    },
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
  console.log(req.query);
  const { fromLat, fromLng, toLat, toLng, radiusfrom, radiusTo } =
    req.query as {
      fromLat?: Number;
      fromLng?: Number;
      toLat?: Number;
      toLng?: Number;
      radiusfrom?: Number;
      radiusTo?: Number;
    };

  const radiusFromInMeters = Number(radiusfrom ?? 20) * 1000;
  const radiusToInMeters = Number(radiusTo ?? 20) * 1000;

  const query: any = {};

  // Handle "from" location filter if both coords are present
  if (fromLat && fromLng) {
    query.from = {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [+fromLng, +fromLat], // [lng, lat]
        },
        $maxDistance: radiusFromInMeters,
      },
    };
  }

  // Handle "to" location filter if both coords are present
  if (toLat && toLng) {
    query.to = {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [+toLng, +toLat], // [lng, lat]
        },
        $maxDistance: radiusToInMeters,
      },
    };
  }

  const rides = await Ride.find(query)
    .populate("UserId", "-password -__v")
    .sort({ createdAt: -1 });

  ResponseJson(res, 200, "Rides found", rides);
}, "Get All Rides");

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
