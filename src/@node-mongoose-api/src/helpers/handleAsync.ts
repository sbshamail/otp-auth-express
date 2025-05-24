import { IncomingForm } from "formidable";
import { handleError } from "./errorHandler";
import { ResponseJson } from "./ResponseJson";
import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import {
  FnType,
  FnSessionType,
  FnFormidableType,
  FnFormidableTypeSession,
} from "../interface/types";

export const handleAsync = (
  fn: FnType,
  modelName?: string,
  status = 400,
  customError?: string
) => {
  return async (req: Request, res: Response, next?: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.log(`error on =====${modelName}===`, error);
      if (customError) {
        return ResponseJson(res, status, customError);
      }
      handleError(res, error);
      if (next) {
        next(error);
      }
    }
  };
};

export const handleAsyncSession = (
  fn: FnSessionType,
  modelName: string,
  status = 400,
  customError?: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await fn(req, res, next, session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.log(`Error in ${modelName}:`, error);
      if (!res.headersSent) {
        if (customError) {
          ResponseJson(res, status, customError);
        } else {
          handleError(res, error);
        }
      }
      next(error);
    } finally {
      session.endSession();
    }
  };
};

export const handleFormAsync = (
  fn: FnFormidableType,
  modelName: string,
  status = 400,
  customError?: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let form = new IncomingForm();
    form.parse(
      req,
      async (err: any, fields: Record<string, any>, files: any) => {
        try {
          await fn(req, res, next, err, fields, files);
        } catch (error) {
          console.log(`Error in ${modelName}:`, error);
          if (customError) {
            ResponseJson(res, status, customError);
          } else {
            handleError(res, error);
            next(error);
          }
        }
      }
    );
  };
};

export const handleFormAsyncSession = (
  fn: FnFormidableTypeSession,
  modelName: string,
  status = 400,
  customError?: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let form = new IncomingForm();
    form.parse(
      req,
      async (err: any, fields: Record<string, any>, files: any) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          await fn(req, res, next, session, err, fields, files);
          await session.commitTransaction();
        } catch (error) {
          await session.abortTransaction();
          console.log(`Error in ${modelName}:`, error);
          if (customError) {
            ResponseJson(res, status, customError);
          } else {
            handleError(res, error);
            next(error);
          }
        } finally {
          session.endSession();
        }
      }
    );
  };
};
