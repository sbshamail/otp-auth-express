import { Request, Response } from 'express';
import mongoose, { ClientSession, Model, ObjectId } from 'mongoose';

interface Options {
  session?: ClientSession; // Adjust according to your session type
}
// ## Create Types ##
export interface CreateApiType {
  data: object;
  options?: Options;
}

// ## Update Types ##
export interface FindByIdAndUpdateType {
  id: string | ObjectId;
  data: object;
  options?: Options;
}
export interface UpdateManyType {
  ids: string[] | ObjectId[];
  data: object;
  options?: Options;
}

export interface UpdateManyFastType {
  req: Request;
  res: Response;
}

// ## Delete Types ##
export interface DeleteOneType {
  id: string | ObjectId;
  options?: Options;
}

export interface DeleteManyType {
  ids: string[] | ObjectId[];
  options?: Options;
}
export interface DeleteManyFastType {
  req: Request;
  res: Response;
}
//## List Types & Aggregation ##
export interface CustomParamsTypeQuery {
  projectionFields: mongoose.ProjectionType<any>;
  searchTerms?: string[];
  numericSearchTerms?: string[];
  fromDate?: string;
  toDate?: string;
  fieldDate?: string;
  lookup?: mongoose.PipelineStage[];
}

export interface QueryType {
  searchTerm?: string;
  sortField?: string;
  columnFilters?: string[];
  deleted?: string;
  fromDate?: string;
  toDate?: string;
  fieldDate?: string;
  sortOrder?: number | string;
  limit?: number | string;
  page?: number | string;
}

// Base types
interface BaseListAggregationType {
  query?: QueryType;
  model: Model<any>;
  ownPipeline?: ({}: AggregationPipelineFunctionType) => any;
  numbering?: boolean;
  ids?: string[] | ObjectId[];
  cache?: string;
  options?: Options;
}
// Interface when `ownPipeline` is present, making `customParams` optional
interface WithOwnPipeline extends BaseListAggregationType {
  ownPipeline: ({}: AggregationPipelineFunctionType) => any;
  customParams?: CustomParamsTypeQuery; // Optional
}

// Interface when `ownPipeline` is absent, making `customParams` required
interface WithoutOwnPipeline extends BaseListAggregationType {
  ownPipeline?: never; // Not allowed
  customParams: CustomParamsTypeQuery; // Required
}

// Combine both interfaces into a single union type
export type ListAggregationType = WithoutOwnPipeline | WithOwnPipeline;

export interface ColumnFilterType {
  id: string;
  value: string | number | string[]; // value can be string, number, or an array of strings
}
export interface AggregationPipelineFunctionType {
  skip: number;
  limit: number;
  searchTerm?: string;
  columnFilters?: ColumnFilterType[];
  deleted?: string;
  sortField: string;
  sortOrder: number;
  ids?: ObjectId[] | string[];
  customParams?: CustomParamsTypeQuery;
}

export interface AggregationResult {
  total: number;
  data: any[];
  extra?: any;
}

export interface MatchStagesTypes {
  searchTerm?: string;
  searchTerms?: string[];
  numericSearchTerms?: string[];
  deleted?: string;
  columnFilters?: ColumnFilterType[];
  fromDate?: string;
  toDate?: string;
  fieldDate?: string;
}
