/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources, TGenericErrorResponse } from "../interfaces/error.types";


// handle zod error
export const handleZodError = (err: any): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = [];

  const errorsObject = JSON.parse(err);
  errorsObject.forEach((errorObject: any) => {
    errorSources.push({
      path:
        errorObject.path.length > 1
          ? errorObject.path.slice().reverse().join(" inside ")
          : errorObject.path[0],
      message: errorObject.message,
    });
  });

  return {
    statusCode: 400,
    message: "Zod Error!",
    errorSources: errorSources,
  };
};