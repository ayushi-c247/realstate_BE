// Third-party modules
import type { NextFunction, Request, Response } from 'express';

// Constants
import {
  BAD_REQUEST,
  OK,
  SERVER_ERROR,
  commonMessages,
  commonVariables,
} from '@constants';

// Utils
import { ErrorHandler } from '@utils';
import { CustomError, ICustomError } from '@customTypes';

// Types

/**
 * This middleware handles all errors and sends a standardized response to the client.
 * It catches the error from the previous middleware and handles it according to the error type.
 * If the error is not of a specific type, it will be handled as a general internal server error.
 * @param {CustomError} err - The error object from the previous middleware
 * @param {Request} _req - The express request object
 * @param {Response} res - The express response object
 * @param {NextFunction} _next - The next function in the middleware chain
 * @returns {void}
 */
export const errorMiddleware = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  err.statusCode = err.statusCode ?? SERVER_ERROR;
  err.message = err.message || commonMessages.INTERNAL_SERVER_ERROR;
  err.success = err.success || false;
  err.error = err.error ?? null;

  switch (err?.error?.name) {
    case commonVariables.CAST_ERROR:
      err = new ErrorHandler(
        `${commonMessages.RESOURCE_NOT_FOUND}. Invalid ${err.error.path}`,
        BAD_REQUEST,
        err.error.message,
      );
      break;
    case commonVariables.DUPLICATE_KEY_ERROR:
      err = new ErrorHandler(
        `Duplicate ${Object.keys(err.error.keyValue)} Entered`,
        BAD_REQUEST,
        err.error.message,
      );
      break;
    case commonVariables.JSON_WEB_TOKEN_ERROR:
      err = new ErrorHandler(commonMessages.INVALID_TOKEN, BAD_REQUEST);
      break;
    case commonVariables.TOKEN_EXPIRED_ERROR:
      err = new ErrorHandler(commonMessages.EXPIRE_TOKEN, BAD_REQUEST);
      break;
    default:
      if (commonVariables.MYSQL_ERRORS.includes(err?.error?.name)) {
        err = new ErrorHandler(
          commonMessages.DATABASE_ERROR,
          SERVER_ERROR,
          err.error.message,
        );
      }
      break;
  }

  const response: { success: boolean; message: string; error?: ICustomError } =
    {
      success: false,
      message: err.message,
    };

  // Only add the data field if it's not null
  if (err.error !== null) {
    response.error = err?.error?.message ?? err.error;
  }

  res.status(err.statusCode ?? SERVER_ERROR).json(response);
};

/**
 * Sends a standardized response to the client.
 * @param {Response} res - The express response object
 * @param {string} message - The message to be sent to the client
 * @param {number} [status=OK] - The status code for the response
 * @param {any} [data=null] - The data to be sent to the client
 * @returns {Promise<void>} - A promise that resolves once the response is sent
 */
export const responseHandler = async (
  res: Response,
  message: string,
  status: number = OK,
  data: any = null,
) => {
  const response: { success: boolean; message: string; data?: any } = {
    success: true,
    message,
  };

  // Only add the data field if it's not null
  if (data !== null) {
    response.data = data;
  } else {
    response.data = null;
  }

  return res.status(status).json(response);
};
