import { Model } from 'mongoose';

import { ResponseJson } from '../helpers/ResponseJson';
import { message } from '../helpers/Messages';
import {
  DeleteOneType,
  DeleteManyFastType,
  DeleteManyType
} from '../interface/crud.operation';

export class DeleteOperation {
  private model: Model<any>;

  constructor(model: Model<any>) {
    this.model = model;
  }
  // ## deleteOne ##
  async deleteOne({
    id,
    options = {}
  }: DeleteOneType): Promise<{ success?: string; result?: any; error?: string }> {
    if (!id) {
      return { error: 'No Found Id' };
    }
    const result = await this.model.deleteOne({ _id: id }, options);
    return { success: message.DELETE_SUCCESS, result };
  }
  // ## deleteMany ##
  async deleteMany({
    ids,
    options = {}
  }: DeleteManyType): Promise<{ success?: string; result?: any; error?: string }> {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return { error: 'Not Found Ids' };
    }
    const result: any = await this.model.deleteMany({ _id: { $in: ids } }, options);
    return { success: message.DELETE_SUCCESS, result };
  }
  // ## UdeleteManyFast ##
  async deleteManyFast({ req, res }: DeleteManyFastType) {
    const ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return ResponseJson(res, 400, 'Not Found Ids');
    }
    try {
      await this.model.deleteMany({ _id: { $in: ids } });
      ResponseJson(res, 200, message.DELETE_SUCCESS);
    } catch (error) {
      console.log(this.model.modelName, error);
      ResponseJson(res, 500, message.GET_ERROR);
    }
  }
}

export type DeleteOperationType = InstanceType<typeof DeleteOperation>;
