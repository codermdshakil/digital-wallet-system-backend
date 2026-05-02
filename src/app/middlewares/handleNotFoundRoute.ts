import { Request, Response } from "express";


export const handleNotFoundRoute = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
};
