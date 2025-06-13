import { Request, Response, NextFunction } from "express";
import { Ride } from "../../models/Ride";

import { helpers, NodeMongooseApi } from "../../../@node-mongoose-api/src";
import { getDistanceFromLatLng } from "./fn";
const { ResponseJson, handleAsync } = helpers;

const model = Ride;
const { listAggregation, lookupUnwindStage } = NodeMongooseApi(model);

export const createRide = handleAsync(async (req: Request, res: Response) => {
  const { arrivalTime, from, to, ...rest } = req.body;
  const fromCoordinates = [Number(from.longitude), Number(from.latitude)]; // longitude first!
  const toCoordinates = [Number(to.longitude), Number(to.latitude)];

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

export const getRidesByUserId = handleAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id; // assuming you’ve set `req.user` from JWT middleware
    console.log(userId);
    const query = req.query;
    const customParams = {
      projectionFields: {
        fromLocation: 1,
        toLocation: 1,
        UserId: { _id: 1, phone: 1, fullName: 1 },
      },
      lookup: [...lookupUnwindStage("users", "UserId", "_id", "UserId")],
      searchTerms: ["UserId"],
    };
    const response = await listAggregation({
      model,
      query,
      customParams,
    });
    if (response) {
      const { total, data } = response;
      ResponseJson(res, 200, "Rides fetched successfully", data, total);
      return;
    }

    // const rides = await Ride.find({ UserId: userId }).sort({ createdAt: -1 });

    // if (!rides.length) {
    //   return ResponseJson(res, 404, 'No rides found');
    // }

    // ResponseJson(res, 200, 'Rides fetched successfully', rides);
  },
  "Get Rides By UserId"
);

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
