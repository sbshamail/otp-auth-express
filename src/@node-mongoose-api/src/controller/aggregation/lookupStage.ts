import mongoose from 'mongoose';

export const lookupUnwindStage = (
  from: string,
  localField: string,
  foreignField: string,
  as: string
): mongoose.PipelineStage[] => {
  return [
    {
      $lookup: {
        from: from,
        localField: localField,
        foreignField: foreignField,
        as: as
      }
    },
    {
      $unwind: {
        path: `$${as}`,
        preserveNullAndEmptyArrays: true
      }
    }
  ];
};

export const lookupStage = (
  from: string,
  localField: string,
  foreignField: string,
  as: string
): mongoose.PipelineStage => {
  return {
    $lookup: {
      from: from,
      localField: localField,
      foreignField: foreignField,
      as: as
    }
  };
};
export type lookupUnwindStageType = typeof lookupUnwindStage;
export type lookupStageType = typeof lookupStage;
