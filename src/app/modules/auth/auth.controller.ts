/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import passport from "passport";
import { envVars } from "../../config/env";
import AppError from "../../errorHandlers/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { clearCookie, setAuthCookie } from "../../utils/setCookie";
import { createUserTokens } from "../../utils/userTokens";
import { AuthService } from "./auth.service";


// create user and get access and refresh token
const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const loginInfo = await AuthServices.credentialsLogin(req.body);

    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        return next(
          new AppError(StatusCodes.BAD_REQUEST, "Something want wrong!"),
        );
      }

      if (!user) {
        return next(new AppError(StatusCodes.BAD_REQUEST, info.message));
      }

      const userTokens = await createUserTokens(user);

      // delete password
      // delete user.toObject().password;

      const { password: pass, ...rest } = user.toObject();

      // set accessToken, refreshToken to cookies
      setAuthCookie(res, userTokens);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Succcessfully user Logged In!!",
        data: {
          accessToken: userTokens.accessToken,
          refreshToken: userTokens.refreshToken,
          user: rest,
        },
      });
    })(req, res, next);
  },
);

// using refresh-token get new accessToken
const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // from cookies get refreshToken
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "No refreshToken recived from cookies!",
      );
    }

    const tokenInfo = await AuthService.getNewAccessToken(refreshToken);

    // set updated accessToken  to cookies
    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Succcessfully get AccessToken!!",
      data: tokenInfo,
    });
  },
);

// logout
const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // clear accessToken and refreshToken from cookie
    clearCookie(res);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "User Logout Succcessfully!!",
    });
  },
);

// change password
const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    await AuthService.changePassword(
      oldPassword,
      newPassword,
      decodedToken as JwtPayload,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Password updated Succcessfully!!",
    });
  },
);


// set password
const setPassword = catchAsync(  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const { password } = req.body;

    await AuthService.setPassword(decodedToken.userId, password);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Password Changed Successfully",
      data: null,
    });
  },
);


// reset password 
const resetPassword = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
  
    const decodedToken = req.user;

    await AuthService.resetPassword( req.body, decodedToken as JwtPayload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Password updated Succcessfully!!",
    });

  },
);

// const forgetPassword = catchAsync(  async (req: Request, res: Response, next: NextFunction) => {

//     const { email } = req.body;

//     await AuthServices.forgetPassword(email);

//     sendResponse(res, {
//       success: true,
//       statusCode: StatusCodes.OK,
//       message: "Email send Successfully",
//       data: null,
//     });
//   },
// );

const googleCallbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? (req.query.state as string) : "";

    if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.slice(1);
    }

    const user = req.user;
    // console.log(user, "user");

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not Found!");
    }

    // generate token accessToken, refreshToken
    const tokenInfo = await createUserTokens(user);

    // set tokens to cookie
    setAuthCookie(res, tokenInfo);

    // rediract
    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
  },
);



export const AuthController = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  changePassword,
  setPassword,
  resetPassword,
  googleCallbackController,

}

