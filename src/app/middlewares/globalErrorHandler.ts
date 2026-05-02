import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHandlers/AppError";
import { handleCastError } from "../helpers/handleCastError";
import { handleDuplicateError } from "../helpers/handleDuplicateError";
import { handleValidationError } from "../helpers/handleValidationError";
import { handleZodError } from "../helpers/handleZodError";
import { TErrorSources } from "../interfaces/error.types";

export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.log(err);
  }
   
  let statusCode = 500;
  let message = "Someting want wrong!";
  let errorSources: TErrorSources[] = [];

  //  এর মানে হল err যদি  AppError  এর object হয় তাহলে  statusCode, message গুলু value পরিবর্তন হবে
  // mongoose duplicate error handle
  if (err.code === 11000) {
    const result = handleDuplicateError(err);
    statusCode = result.statusCode;
    message = result.message;
  }
  // mongoose ObjectId Error / CastError
  else if (err.name === "CastError") {
    const result = handleCastError(err);
    statusCode = result.statusCode;
    message = result.message;
  }
  // Zod Error
  else if (err.name === "ZodError") {
    const result = handleZodError(err);
    statusCode = result.statusCode;
    message = result.message;
    errorSources = result.errorSources as TErrorSources[];
  }
  // Mongoose Validation Error
  else if (err.name === "ValidationError") {
    const result = handleValidationError(err);
    statusCode = result.statusCode;
    message = result.message;
    errorSources = result.errorSources as TErrorSources[];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    //  এর মানে হল err যদি  Error  এর object হয় তাহলে  statusCode, message গুলু value পরিবর্তন হবে
    statusCode = 500;
    message = err.message;
  }

  res.status(statusCode).json({
    message,
    errorSources,
    err: envVars.NODE_ENV === "development" ? err : null,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};