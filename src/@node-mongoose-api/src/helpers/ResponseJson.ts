import { Response } from "express";
export const ResponseJson = (
  res: Response,
  code: number,
  message: string,
  data?: any,
  total?: number,
  custom?: {}
) => {
  // Construct the Record object
  let Record: Record<string, any> = {};
  let status = code < 300 ? "SUCCESS" : "ERROR";
  let success = code < 300 ? 1 : 0;

  // Add tableData to the Record object if it's provided
  if (data !== undefined) {
    Record.data = data;
    //   Record.tableData = data;
  }

  // Add total to the Record object if it's provided
  if (total !== undefined) {
    Record.total = total;
  }

  // Return the response
  return res
    .status(code)
    .json({ ...Record, ...custom, status, success, message });
  //   return res.status(code).json({ Record,status,message});
};
