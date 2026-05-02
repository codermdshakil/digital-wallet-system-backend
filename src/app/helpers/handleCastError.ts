import mongoose from "mongoose";
import { TGenericErrorResponse } from "../interfaces/error.types";


export const handleCastError = (err: mongoose.Error.CastError): TGenericErrorResponse => {
  const { path, value, kind } = err;

  return {
    statusCode: 400,
    message: `Invalid value "${value}" for field "${path}". Expected ${kind} format.`,
  };
}