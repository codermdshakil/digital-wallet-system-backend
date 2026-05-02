import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHandlers/AppError";
import { IsActive, IUser } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwt";


export const createUserTokens = (user:Partial<IUser>) => {

  const jwtPayload = {
    userId:user._id,
    email:user.email,
    role:user.role
  };

  const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);
  const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES);

  return {
    accessToken,
    refreshToken
  }

}


export const createAccessTokenWithRefreshToken = async (refreshToken:string) => {

   // 1. verify refreshtoken
    const verifiedRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload;
    
    // 2. check isUserExit?
  
    const isUserExist = await User.findOne({email:verifiedRefreshToken.email});
  
    if(!isUserExist){
      throw new AppError(StatusCodes.BAD_REQUEST, "User not Found!!")
    }
  
    if(isUserExist.isActive ===  IsActive.BLOCKED || isUserExist.isActive ===  IsActive.INACTIVE){
      throw new AppError(StatusCodes.BAD_REQUEST, `User is ${isUserExist.isActive}!!`)
    }
  
    if(isUserExist.isDeleted){
      throw new AppError(StatusCodes.BAD_REQUEST, "User is Deleted!!")
    }
  
  
    // now generate new accessToken
  
    const jwtPayload = {
      userId:isUserExist._id,
      email:isUserExist.email,
      role:isUserExist.role
    };
  
    // create accessToken using refreshToken
    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET,envVars.JWT_ACCESS_EXPIRES);
    return accessToken;

}

