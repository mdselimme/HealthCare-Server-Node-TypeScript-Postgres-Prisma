import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { handleZodError } from "../helpers/handleZodError";
import { TErrorSources } from "../interfaces/error.types";
import { Prisma } from "@prisma/client";
import config from "../../config";

// Sanitize error details for production
const sanitizeError = (error: any) => {
  // Don't expose Prisma errors in production
  if (process.env.NODE_ENV === "production" && error.code?.startsWith("P")) {
    return {
      message: "Database operation failed",
      errorDetails: null,
    };
  }
  return error;
};

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


  if (config.node_env === "development") {
    console.error("Global Error Handler:", err);
  }

  if (error.name === "ZodError") {
    const simplifiedError = handleZodError(error);

    message = simplifiedError.message;
    errorSource = simplifiedError.errorSources as TErrorSources[];
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if ((error.code = "P2002")) {
      message = "Duplicate key error.";
      error = error.meta;
    }
    if ((error.code = "P2003")) {
      message = "Foreign key constraint error.";
      error = error.meta;
    }
    if ((error.code = "P1000")) {
      message = "Authentication failed against database server.";
      error = error.meta;
    }
    if ((error.code = "P2025")) {
      message = "No record was found for a query.";
      error = error.meta;
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    message = "Prisma Validation Error";
    error;
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    message = "Unknown Prisma error.";
    error;
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    message = "Prisma client initialization error.";
    error;
  } else if (error instanceof Error) {
    statusCode = 500;
    message = error.message;
  }
  // Sanitize error before sending response
  const sanitizedError = sanitizeError(error);

  res.status(statusCode).json({
    success,
    statusCode,
    message,
    error: sanitizedError,
    errorSource,
    stack: config.node_env === "development" ? error.stack : null,
  });
};

export default globalErrorHandler;
