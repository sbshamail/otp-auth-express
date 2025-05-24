import { Response } from 'express';
import { ResponseJson } from './ResponseJson';

export const handleError = (res: Response, error: any) => {
  if (error?.code === 11000) {
    return ResponseJson(res, 400, ErrorHandler2(error));
  } else {
    return ResponseJson(res, 400, ErrorHandler(error));
  }
};

export const ErrorHandler = (err: any) => {
  return err.message
    ? err.message.substring(err.message.lastIndexOf(':') + 1)
    : 'An Unexpected Error on server site';
};

export const uniqueMessage = (error: any) => {
  console.log('uniqueMessage', error);
  let output;
  try {
    let fieldName = error.message.substring(
      error.message.lastIndexOf('.$') + 2,
      error.message.lastIndexOf('_1')
    );
    output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';
  } catch (ex) {
    output = 'Unique field already exists';
  }

  return output;
};
export const ErrorHandler2 = (error: any) => {
  let message = '';

  if (error.code) {
    switch (error.code) {
      case 11000:
      case 11001:
        message = uniqueMessage(error);
        break;
      default:
        message = 'Something went wrong';
    }
  } else {
    for (let errorName in error.errorors) {
      if (error.errorors[errorName].message) message = error.errorors[errorName].message;
    }
  }

  return message.substring(message.lastIndexOf(':') + 2);
};
