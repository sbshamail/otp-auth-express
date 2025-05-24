import { Model } from 'mongoose';
import { Utility } from '../helpers/Utility';

import { CreateApiType } from '../interface/crud.operation';

export class CreateOperation {
  private model: Model<any>;

  constructor(model: Model<any>) {
    this.model = model;
  }

  async create({ data, options = {} }: CreateApiType) {
    Utility.removeUndefined(data);
    const api = new this.model(data);
    const response = await api.save(options);
    return response;
  }
}
export type CreateOperationType = InstanceType<typeof CreateOperation>;
