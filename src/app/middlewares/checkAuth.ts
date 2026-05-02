import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHandlers/AppError";
import { IsActive } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";


export const checkAuth =
  (...AuthRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. get access token
      const accessToken = req.headers.authorization;

      // handle error
      if (!accessToken) {
        throw new AppError(StatusCodes.BAD_REQUEST, "No token Recived!");
      }

      // 2. get verified token
      const verifiedToken = verifyToken(  accessToken, envVars.JWT_ACCESS_SECRET,) as JwtPayload;

      // user validation check

      const isUserExist = await User.findOne({ email: verifiedToken.email });

      if (!isUserExist) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User does not Found!!");
      }

      if ( isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
        throw new AppError( StatusCodes.BAD_REQUEST, `User is ${isUserExist.isActive}!!`);
      }

      if (isUserExist.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User is Deleted!!");
      }
      
      if (!isUserExist.isVerified) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User is not verified!!");
      }

      

      // handle error
      if (!verifiedToken) {
        throw new AppError(StatusCodes.BAD_REQUEST, "You are not Authorized!");
      }

      if (!AuthRoles.includes(verifiedToken.role)) {
        throw new AppError( StatusCodes.BAD_REQUEST, "You are not permitted to view this Route!");
      }

      req.user = verifiedToken;

      next();
    } catch (error) {
      next(error);
    }
  };