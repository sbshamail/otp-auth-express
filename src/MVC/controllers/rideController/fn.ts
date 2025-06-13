import {
  hasHourMin,
  parseToUtcDate,
  validateUtcOrDmyDate,
} from "../../../utils/dateFormat";

import { helpers } from "../../../@node-mongoose-api/src";
import { NextFunction, Request, Response } from "express";

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

export function getDistanceFromLatLng(lat1, lng1, lat2, lng2) {
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
