
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import bcryptjs from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHandlers/AppError";
import { createAccessTokenWithRefreshToken } from "../../utils/userTokens";
import { IAuthProvider } from "../user/user.interface";
import { User } from "../user/user.model";


// const credentialsLogin = async (payload: Partial<IUser>) => {
//   const { email, password } = payload;

//   // check user exist or not
//   const isUserExist = await User.findOne({ email });

//   if (!isUserExist) {
//     throw new AppError(StatusCodes.BAD_REQUEST, "User Not Found!");
//   }

//   const isPasswordMatched = await bcryptjs.compare(
//     password as string,
//     isUserExist.password as string,
//   );

//   if (!isPasswordMatched) {
//     throw new AppError(StatusCodes.BAD_REQUEST, "Incurrect Password!");
//   }

//   const userTokens = createUserTokens(isUserExist);

//   // delete password from user
//   const { password: _password, ...rest } = isUserExist.toObject();
//   // delete isUserExist.password;

//   return {
//     accessToken: userTokens.accessToken,
//     refreshToken: userTokens.refreshToken,
//     user: rest,
//   };
// };

// using refreshToken get new AccessToken

const getNewAccessToken = async (refreshToken: string) => {
  const accessToken = await createAccessTokenWithRefreshToken(refreshToken);
  return { accessToken };
};

// reset or change password
const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload,
) => {
  const user = await User.findById(decodedToken.userId);

  const isOldPasswordMatched = await bcryptjs.compare(
    oldPassword,
    user!.password as string, 
  );

  if (!isOldPasswordMatched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Old password doen't Matched");
  }

  const newHashedPassword = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT),
  );

  // update user with new password
  user!.password = newHashedPassword;

  // save user
  user?.save();
};

// এই setPassword function-টা মূলত Google login করা user পরে manually password set করতে পারবে — এই feature implement করছে।
const setPassword = async (userId: string, plainPassword: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User not Found!");
  }

  if (
    user.password &&
    user.auths.some((providerObject) => providerObject.provider === "google")
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You have already set your Password!. Now you can change the password from your Profile Update Password",
    );
  }

  const hashPassword = await bcryptjs.hash(
    plainPassword,
    Number(envVars.BCRYPT_SALT),
  );

  const credentialsProvider: IAuthProvider = {
    provider: "credentials",
    providerId: user.email,
  };

  const auths: IAuthProvider[] = [...user.auths, credentialsProvider];

  user.password = hashPassword;
  user.auths = auths;

  await user.save();
};


// const forgetPassword = async (email: string) => {

//   const isUserExist = await User.findOne({ email });

//   if (!isUserExist) {
//     throw new AppError(StatusCodes.BAD_REQUEST, "User not Exist !");
//   }

//   if ( isUserExist.isActive === IsActive.BLOCKED ||  isUserExist.isActive === IsActive.INACTIVE) {
//     throw new AppError( StatusCodes.BAD_REQUEST,`User is ${isUserExist.isActive}!!`);
//   }

//   if (isUserExist.isDeleted) {
//     throw new AppError(StatusCodes.BAD_REQUEST, "User is Deleted!!");
//   }

//   if (!isUserExist.isVerified) {
//     throw new AppError(StatusCodes.BAD_REQUEST, "User is not verified!!");
//   }


//   // Gmail Sent

//   // const jwtPayload = {
//   //   userId: isUserExist._id,
//   //   email:isUserExist.email,
//   //   role:isUserExist.role
//   // };


//   // const resetToken = jwt.sign(jwtPayload,envVars.JWT_ACCESS_SECRET, {
//   //   expiresIn:"10m"
//   // });

//   // const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;


//   // sendEmail({
//   //   to:isUserExist.email,
//   //   subject:"Password Reset",
//   //   templateName:"forgetPassword", // template filename without .ejs extention ejact same
//   //   templateData:{
//   //     name:isUserExist.name,
//   //     resetUILink:resetUILink
//   //   }

//   // })



//   /**
//    * http://localhost:5173/reset-password?id=69e3525653c774aae3c273d4&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWUzNTI1NjUzYzc3NGFhZTNjMjczZDQiLCJlbWFpbCI6InR1aXRpb24wNTEyQGdtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzc2NTA1NjY1LCJleHAiOjE3NzY1MDYyNjV9.d9M-WNcFyRyYIA1PzPubecim4QbKHsNvcspNrKw2JqY
//    * */ 


// };

const resetPassword = async (payload:Record<string, any>, decodedToken: JwtPayload) => {


  if(payload.id != decodedToken.userId){
    throw new AppError(StatusCodes.BAD_REQUEST, "You can't reset your Password!");
  }

  const isUserExist = await User.findById(decodedToken.userId);

  if(!isUserExist){
      throw new AppError(StatusCodes.BAD_REQUEST, "User not Found!");
  }


  const hashPassword = await bcryptjs.hash(payload.newPassword, Number(envVars.BCRYPT_SALT));

  isUserExist.password = hashPassword;

  await isUserExist.save();

  return {} 
};


export const AuthService = {
  // credentialsLogin,
  getNewAccessToken,
  resetPassword,
  setPassword,
  // forgetPassword,
  changePassword,
};