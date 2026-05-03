import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHandlers/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WalletService } from "./wallet.service";

 

export const addMoney = catchAsync(async (req: Request, res: Response) => {

  const user = req.user as JwtPayload;

  if (!user.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized access");
  }

  const { amount, receiverWalletId } = req.body;

  // basic guard (Zod থাকলে middleware-এ হবে, তবুও safety)
  if (!amount || !receiverWalletId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Amount and receiverWalletId are required"
    );
  }

  const payload = {
    amount,
    receiverWalletId,
    userId: user.userId.toString(),
  };

  const result = await WalletService.addMoney(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Money added successfully",
    data: result,
  });
});

export const WalletController = {
  addMoney,
};
