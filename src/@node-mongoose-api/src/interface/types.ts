import { NextFunction, Request, Response } from "express";
import { CreateOperationType } from "../controller/create";
import { UpdateOperationType } from "../controller/update";
import { DeleteOperationType } from "../controller/remove";
import mongoose, { ClientSession } from "mongoose";
import { MessageType } from "../helpers/Messages";
import { UtilityType } from "../helpers/Utility";
import { AggregationResult, ListAggregationType } from "./crud.operation";
import {
  lookupUnwindStageType,
  lookupStageType,
} from "../controller/aggregation/lookupStage";

export type FnType = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<void>;
export type FnSessionType = (
  req: Request,
  res: Response,
  next: NextFunction,
  session: ClientSession //transaction
) => Promise<void>;

export type FnFormidableType = (
  req: Request,
  res: Response,
  next: NextFunction,
  err: any,
  fields: Record<string, any>,
  files: string[]
) => Promise<void>;
export type FnFormidableTypeSession = (
  req: Request,
  res: Response,
  next: NextFunction,
  session: ClientSession, //transaction
  err: any,
  fields: Record<string, any>,
  files: string[]
) => Promise<void>;

//##list aggregation##
export interface CustomParamsType {
  projectionFields: mongoose.ProjectionType<any>;
  searchTerms?: string[];
  numericSearchTerms?: string[];
  lookup?: mongoose.PipelineStage[];
}
type ListAggregationReturnType = (
  params: ListAggregationType
) => Promise<AggregationResult>;
//##list aggregation end <--##

export interface ApiType {
  updateOp: UpdateOperationType;
  createOp: CreateOperationType;
  deleteOp: DeleteOperationType;
  listAggregation: ListAggregationReturnType;
  lookupUnwindStage: lookupUnwindStageType;
  lookupStage: lookupStageType;
}

export interface HelperType {
  handleAsync: (
    fn: FnType,
    modelName?: string,
    status?: number,
    customError?: string
  ) => (req: Request, res: Response, next: NextFunction) => void;

  handleAsyncSession: (
    fn: FnSessionType,
    modelName: string,
    status?: number,
    customError?: string
  ) => (req: Request, res: Response, next: NextFunction) => void;
  handleFormAsync: (
    fn: FnFormidableType,
    modelName: string,
    status?: number,
    customError?: string
  ) => (req: Request, res: Response, next: NextFunction) => void;
  handleFormAsyncSession: (
    fn: FnFormidableTypeSession,
    modelName: string,
    status?: number,
    customError?: string
  ) => (req: Request, res: Response, next: NextFunction) => void;
  ResponseJson: (
    res: Response,
    code: number,
    message: string,
    data?: any,
    total?: number,
    custom?: {}
  ) => void;
  message: MessageType;
  utility: UtilityType;
}
