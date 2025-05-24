import mongoose, { PipelineStage, ObjectId } from 'mongoose';
import {
  AggregationPipelineFunctionType,
  MatchStagesTypes
} from '../../interface/crud.operation';
import { ColumnFilterHandler, dateStartToEnd, searching } from './matchStagesFilter';

// match stage filtering aggregation
const matchStages = ({
  searchTerm,
  numericSearchTerms,
  searchTerms,
  deleted,
  columnFilters,
  fromDate,
  toDate,
  fieldDate
}: MatchStagesTypes) => {
  let matchStage: Record<string, any> = {
    ...(searchTerm && {
      $or: [
        ...(numericSearchTerms && numericSearchTerms.length > 0
          ? numericSearchTerms.map(search => {
              const condition: Record<string, any> = {};
              condition[search] = Number(searchTerm);
              return condition;
            })
          : []),

        ...(searchTerms && searchTerms.length > 0
          ? searchTerms.map(search => {
              return searching(search, searchTerm);
            })
          : [])
      ]
    }),
    deleted: deleted
  };
  if (columnFilters && columnFilters.length) {
    const columnFilterHandler = new ColumnFilterHandler(numericSearchTerms);
    matchStage.$and = columnFilterHandler.generateColumnFilterConditions(columnFilters);
  }

  if (fromDate || toDate) {
    dateStartToEnd(fromDate, toDate, matchStage, fieldDate);
  }
  return matchStage;
};

export const createAggregationPipeline = ({
  skip = 0,
  limit = 1000000,
  searchTerm = '',
  columnFilters,
  deleted,
  sortField = 'updatedAt',
  sortOrder = -1,
  ids = [],
  customParams
}: AggregationPipelineFunctionType) => {
  const {
    projectionFields,
    searchTerms,
    numericSearchTerms,
    fromDate,
    toDate,
    fieldDate,
    lookup = []
  } = customParams ?? {};

  const matchStage = matchStages({
    searchTerm,
    columnFilters,
    searchTerms,
    numericSearchTerms,
    fieldDate,
    fromDate,
    toDate,
    deleted
  });

  const dataPipeline: PipelineStage[] | any = [
    ...lookup,
    { $match: matchStage },
    {
      $facet: {
        totalRecords: [{ $count: 'total' }],
        extra: [{ $group: { _id: null, startDate: { $min: '$updatedAt' } } }],
        data: [
          {
            $match: {
              _id:
                ids.length > 0
                  ? {
                      $in: ids.map(
                        (id: string | ObjectId) =>
                          new mongoose.Types.ObjectId(id as string)
                      )
                    }
                  : { $exists: true }
            }
          },
          { $project: projectionFields },
          { $sort: { [sortField]: sortOrder } },
          { $skip: skip },
          { $limit: limit }
        ]
      }
    },
    { $unwind: '$totalRecords' },
    { $unwind: '$extra' },
    { $project: { total: '$totalRecords.total', data: '$data', extra: '$extra' } }
  ];

  return dataPipeline;
};
