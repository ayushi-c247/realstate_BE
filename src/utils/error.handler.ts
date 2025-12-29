import env from '@config/envVar';
import { SERVER_ERROR, commonMessages } from '@constants';
import type { NextFunction } from 'express';

class ErrorHandler extends Error {
  statusCode: number;
  errors: any;
  success: boolean;
  data: any;

  constructor(
    message: string,
    statusCode: number,
    err: any = null,
    success = false,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = err;
    this.success = success;
    this.data = null;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * A centralized error-handling utility to catch and propagate errors.
 * Logs the error (optional) and passes it to the next middleware with a standard structure.
 *
 * @param error - The error object, which can be of any type.
 * @param next - The Express `NextFunction` to pass control to the error-handling middleware.
 */
const catchHandler = (error: unknown, next: NextFunction): void => {
  const errorMessage =
    error instanceof Error
      ? error.message
      : commonMessages.INTERNAL_SERVER_ERROR;

  // Optional: Log the error for debugging in development.
  if (env.NODE_ENV !== 'production') {
    console.error('Error caught in catchHandler:', error);
  }

  // Passes the structured error to the next middleware.
  next(new ErrorHandler(errorMessage, SERVER_ERROR, error));
};

/**
 * A centralized error-handling utility to catch and propagate errors.
 * Logs the error (optional) and passes it to the next middleware with a standard structure.
 *
 * @param error - The error object, which can be of any type.
 * @param next - The Express `NextFunction` to pass control to the error-handling middleware.
 */
const catchUploadHandler = (error: unknown, next: NextFunction): void => {
  const errorMessage: any = error instanceof Error ? error.message : error;

  // Optional: Log the error for debugging in development.
  if (env.NODE_ENV !== 'production') {
    console.error('Error caught in catchHandler:', error);
  }

  // Passes the structured error to the next middleware.
  next(new ErrorHandler(errorMessage, SERVER_ERROR, error));
};

export { ErrorHandler, catchHandler, catchUploadHandler };
