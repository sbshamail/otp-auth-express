import { AggregationResult, ListAggregationType } from '../interface/crud.operation';
import { createAggregationPipeline } from './aggregation/aggregation';
function addRowNumbers(data: any[], pageNumber: number, pageSize: number) {
  return data.map((item, index) => {
    return {
      ...item,
      rowNum: (pageNumber - 1) * pageSize + index + 1
    };
  });
}

export const listAggregation = async ({
  query,
  model,
  ownPipeline,
  customParams,
  numbering,
  ids,
  cache,
  options = {}
}: ListAggregationType): Promise<AggregationResult> => {
  let aggregationPipeline = createAggregationPipeline;

  if (ownPipeline) {
    aggregationPipeline = ownPipeline;
  }
  const { searchTerm, sortField, deleted, fromDate, toDate, fieldDate } = query || {};
  if (customParams) {
    if (fromDate) {
      customParams.fromDate = fromDate;
    }
    if (toDate) {
      customParams.toDate = toDate;
    }
    if (fieldDate) {
      customParams.fieldDate = fieldDate;
    }
  }
  let columnFilters: any[] = [];
  if (query?.columnFilters) {
    if (typeof query?.columnFilters === 'string') {
      try {
        columnFilters = JSON.parse(query.columnFilters);
      } catch (error) {
        console.error('Failed to parse columnFilters:', error);
      }
    } else if (Array.isArray(query?.columnFilters)) {
      columnFilters = query.columnFilters;
    }
  }
  let sortOrder = query?.sortOrder ? parseInt(query.sortOrder as string) : -1;
  let limit = query?.limit ? parseInt(query.limit as string) : 1000;
  let page = query?.page ? parseInt(query.page as string) : 1;
  page === 0 ? (page = 1) : (page = page);
  let skip = (page - 1) * limit;

  const pipeline = aggregationPipeline({
    skip,
    limit,
    searchTerm,
    sortField: sortField ? sortField : 'createdAt',
    sortOrder: sortOrder ? sortOrder : -1,
    columnFilters,
    ids,
    deleted,
    customParams
  });
  let result: AggregationResult[] = [];

  if (cache) {
    // @ts-ignore
    result = await model.aggregate(pipeline, options).cache({ key: cache });
  } else {
    result = await model.aggregate(pipeline, options);
  }

  const total = result.length > 0 ? result[0].total : 0;
  const extra = result.length > 0 ? result[0]?.extra : 0;
  const data = result.length > 0 ? result[0].data : [];
  const dataWithRowNumbers = numbering ? addRowNumbers(data, page, limit) : data;

  return {
    total: total,
    extra: extra,
    data: dataWithRowNumbers
  };
};
