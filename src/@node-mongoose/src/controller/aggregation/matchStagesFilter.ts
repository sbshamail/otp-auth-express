type NumericSearchTerms = string[]; // Array of string IDs that are numeric
import { startOfDay, endOfDay } from 'date-fns';
import { Utility } from '../../helpers/Utility';
import { ColumnFilterType } from '../../interface/crud.operation';
import mongoose from 'mongoose';
const { parseDate } = Utility;

export const dateStartToEnd = (
  fromDate: string = '',
  toDate: string = '',
  matchStage: any,
  fieldDate = 'createdAt'
) => {
  const fromDateParsed = parseDate(fromDate);
  const toDateParsed = parseDate(toDate);
  matchStage.$and = matchStage.$and || [];

  if (fromDateParsed && toDateParsed) {
    // If both fromDate and toDate are provided, filter by the date range
    matchStage.$and.push(
      { [fieldDate]: { $gte: startOfDay(fromDateParsed) } },
      { [fieldDate]: { $lte: endOfDay(toDateParsed) } }
    );
  } else if (fromDateParsed) {
    // If only fromDate is provided, filter for dates equal to or greater than fromDate
    matchStage.$and.push({
      [fieldDate]: {
        $gte: startOfDay(fromDateParsed)
      }
    });
  } else if (toDateParsed) {
    // If only toDate is provided, filter for dates equal to or less than toDate
    matchStage.$and.push({
      [fieldDate]: {
        $lte: endOfDay(toDateParsed)
      }
    });
  }
};
export class ColumnFilterHandler {
  private numericSearchTerms?: NumericSearchTerms;

  constructor(numericSearchTerms?: NumericSearchTerms) {
    this.numericSearchTerms = numericSearchTerms;
  }

  private static handleDateFilter(
    column: ColumnFilterType,
    condition: Record<string, any>
  ) {
    const date = parseDate(column.value as string);
    if (date) {
      condition[column.id] = {
        $gte: date,
        $lte: endOfDay(date) // Cover the entire day
      };
    } else {
      console.error('Invalid date:', column.value);
    }
  }

  private static handleNumericFilter(
    column: ColumnFilterType,
    numericSearchTerms: NumericSearchTerms,
    condition: Record<string, any>
  ) {
    if (!isNaN(Number(column.value)) && numericSearchTerms.includes(column.id)) {
      condition[column.id] = Number(column.value);
    }
  }

  private static handleObjectIdFilter(
    column: ColumnFilterType,
    condition: Record<string, any>
  ) {
    if (mongoose.Types.ObjectId.isValid(column.value as string)) {
      condition[column.id] = new mongoose.Types.ObjectId(column.value as string);
    }
  }

  private static handleArrayFilter(
    column: ColumnFilterType,
    condition: Record<string, any>
  ) {
    if (Array.isArray(column.value)) {
      condition[column.id] = {
        $in: column.value.map((val: string) =>
          mongoose.Types.ObjectId.isValid(val) ? new mongoose.Types.ObjectId(val) : val
        )
      };
    }
  }

  private static handleDefaultFilter(
    column: ColumnFilterType,
    condition: Record<string, any>
  ) {
    condition[column.id] = { $regex: column.value as string, $options: 'i' };
  }

  public generateColumnFilterConditions(
    filters?: ColumnFilterType[]
  ): Record<string, any>[] {
    return (
      filters?.map((column: ColumnFilterType) => {
        const condition: Record<string, any> = {};
        switch (true) {
          case ['createdAt', 'updatedAt', 'date'].includes(column.id):
            ColumnFilterHandler.handleDateFilter(column, condition);
            break;
          case !isNaN(Number(column.value)) &&
            this.numericSearchTerms &&
            this.numericSearchTerms.includes(column.id):
            ColumnFilterHandler.handleNumericFilter(
              column,
              this.numericSearchTerms,
              condition
            );
            break;
          case mongoose.Types.ObjectId.isValid(column.value as string):
            ColumnFilterHandler.handleObjectIdFilter(column, condition);
            break;
          case Array.isArray(column.value):
            ColumnFilterHandler.handleArrayFilter(column, condition);
            break;
          default:
            ColumnFilterHandler.handleDefaultFilter(column, condition);
            break;
        }
        return condition;
      }) || []
    );
  }
}
export const searching = (field: string, searchTerm: string) => {
  return mongoose.Types.ObjectId.isValid(searchTerm)
    ? { [field]: new mongoose.Types.ObjectId(searchTerm) }
    : { [field]: { $regex: searchTerm, $options: 'i' } };
};
