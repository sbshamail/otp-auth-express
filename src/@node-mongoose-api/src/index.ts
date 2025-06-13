import { UpdateOperation } from "./controller/update";
import { CreateOperation } from "./controller/create";
import { DeleteOperation } from "./controller/remove";
import { listAggregation } from "./controller/list";

import {
  lookupStage,
  lookupUnwindStage,
} from "./controller/aggregation/lookupStage";
import { Model } from "mongoose";
import { QueryType } from "./interface/crud.operation";
import { CustomParamsType } from "./interface/types";
import {
  handleAsync,
  handleFormAsync,
  handleAsyncSession,
  handleFormAsyncSession,
} from "./helpers/handleAsync";
import { message } from "./helpers/Messages";
import { ResponseJson } from "./helpers/ResponseJson";

import { ApiType, HelperType } from "./interface/types";
import { Utility } from "./helpers/Utility";

const NodeMongooseApi = (model: Model<any>): ApiType => {
  const updateOp = new UpdateOperation(model);
  const createOp = new CreateOperation(model);
  const deleteOp = new DeleteOperation(model);
  return {
    updateOp,
    createOp,
    deleteOp,
    listAggregation,
    lookupStage,
    lookupUnwindStage,
  };
};

const helpers: HelperType = {
  handleAsync,
  handleAsyncSession,
  handleFormAsync,
  handleFormAsyncSession,
  ResponseJson,
  message,
  utility: Utility,
};

export { NodeMongooseApi, helpers, CustomParamsType, QueryType };
