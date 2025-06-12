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

function getDistanceFromLatLng(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // in meters
}

export const getAllRides = handleAsync(async (req: Request, res: Response) => {
  const {
    fromLat,
    fromLng,
    toLat,
    toLng,
    radiusfrom,
    radiusTo,
    fromLocation,
    toLocation,
  } = req.query as {
    fromLat?: Number;
    fromLng?: Number;
    toLat?: Number;
    toLng?: Number;
    radiusfrom?: Number;
    radiusTo?: Number;
    fromLocation?: string;
    toLocation?: string;
  };

  const radiusFromInMeters = Number(radiusfrom ?? 20) * 1000;
  const radiusToInMeters = Number(radiusTo ?? 35) * 1000;
  const query: any = {};

  // Handle "from" location filter if both coords are present
  if (fromLat && fromLng) {
    query["from.coordinates"] = {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [+fromLng, +fromLat], // [lng, lat]
        },
        $maxDistance: radiusFromInMeters,
      },
    };
  }
  // 📝 Text filter: fromLocation
  if (fromLocation) {
    query.fromLocation = { $regex: fromLocation, $options: "i" }; // case-insensitive match
  }

  // 📝 Text filter: toLocation
  if (toLocation) {
    query.toLocation = { $regex: toLocation, $options: "i" };
  }
  let rides = await Ride.find(query)
    .populate("UserId", "-password -__v")
    .sort({ createdAt: -1 });

  // If `toLat` and `toLng` are provided, filter manually
  if (toLat && toLng) {
    rides = rides.filter((ride: any) => {
      const [lng, lat] = ride.to.coordinates;
      const dist = getDistanceFromLatLng(+toLat, +toLng, lat, lng);
      return dist <= radiusToInMeters;
    });
  }

  if (rides.length > 0) {
    ResponseJson(res, 200, "Rides found", rides);
  } else {
    ResponseJson(res, 400, "No Rides found");
  }
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
