import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHandlers/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Wallet } from "../wallet/wallet.model";
import { TransactionService } from "./transaction.service";

const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
  
  const user = req.user as JwtPayload;

  if (!user || !user.userId) {
    throw new AppError(401, "Unauthorized");
  }

  // get wallet
  const wallet = await Wallet.findOne({ userId: user.userId });

  if (!wallet) {
    throw new AppError(404, "Wallet not found");
  }

  const result = await TransactionService.getMyTransactions(
    user.userId.toString(),
    wallet._id.toString(),
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Transactions retrieved successfully",
    data: result,
  });
});

const getSingleTransaction = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  if (!user || !user.userId) {
    throw new AppError(401, "Unauthorized");
  }

  const { id } = req.params;

  const wallet = await Wallet.findOne({ userId: user.userId });

  if (!wallet) {
    throw new AppError(404, "Wallet not found");
  }

  const result = await TransactionService.getSingleTransaction(
    id as string,
    user.userId.toString(),
    wallet._id.toString(),
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Transaction retrieved successfully",
    data: result,
  });
});

export const TransactionController = {
  getMyTransactions,
  getSingleTransaction,
};
