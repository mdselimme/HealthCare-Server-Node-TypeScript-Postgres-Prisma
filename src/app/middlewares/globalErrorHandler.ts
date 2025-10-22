import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { handleZodError } from "../helpers/handleZodError";
import { TErrorSources } from "../interfaces/error.types";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something went wrong!";
  let error = err;
  let errorSource: TErrorSources[] = [];

  if (error.name === "ZodError") {
    const simplifiedError = handleZodError(error);

    message = simplifiedError.message;
    errorSource = simplifiedError.errorSources as TErrorSources[];
  } else if (error instanceof Error) {
    statusCode = 500;
    message = error.message;
  }

  res.status(statusCode).json({
    success,
    statusCode,
    message,
    error,
    errorSource,
    stack: error.stack,
  });
};

export default globalErrorHandler;
