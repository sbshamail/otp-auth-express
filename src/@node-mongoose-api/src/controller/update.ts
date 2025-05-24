import { Model } from 'mongoose';
import { message } from '../helpers/Messages';
import { ResponseJson } from '../helpers/ResponseJson';
import { Utility } from '../helpers/Utility';
import {
  FindByIdAndUpdateType,
  UpdateManyFastType,
  UpdateManyType
} from '../interface/crud.operation';

export class UpdateOperation {
  private model: Model<any>;

  constructor(model: Model<any>) {
    this.model = model;
  }
  // ## findByIdAndUpdate ##
  async findByIdAndUpdate({ id, data, options = {} }: FindByIdAndUpdateType) {
    Utility.removeUndefined(data);
    const response = await this.model.findByIdAndUpdate(id, data, {
      new: true,
      ...options // Spread the options object here
    });
    return response;
  }
  // ## updateMany ##
  async updateMany({
    ids,
    data,
    options = {}
  }: UpdateManyType): Promise<{ success?: string; result?: any; error?: string }> {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return { error: 'Not Found Ids' };
    }
    Utility.removeUndefined(data);
    const response = await this.model.updateMany(
      { _id: { $in: ids } },
      data,
      { ...options, new: true } // Merge options with new:true
    );
    return { success: message.UPDATED_SUCCESS, result: response };
  }
  // ## updateManyFast ##
  async updateManyFast({ req, res }: UpdateManyFastType) {
    try {
      const data = req.body;
      const { ids, ...updateData } = data;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return { error: 'Not Found Ids' };
      }
      if (!updateData) {
        return ResponseJson(res, 400, 'No data Found For Update');
      }
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return ResponseJson(res, 400, 'Not Found Ids');
      }
      const response = await this.model.updateMany({ _id: { $in: ids } }, updateData, {
        new: true
      });
      return response;
    } catch (error) {
      console.log(this.model.modelName, error);
      ResponseJson(res, 400, message.GET_ERROR);
    }
  }
}
export type UpdateOperationType = InstanceType<typeof UpdateOperation>;
