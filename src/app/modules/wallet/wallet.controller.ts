import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHandlers/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WalletService } from "./wallet.service";

// User Wallet

const getMyWallet = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  if (!user || !user.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized access");
  }

  const result = await WalletService.getMyWallet(user.userId.toString());

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Wallet retrieved successfully",
    data: result,
  });
});

const getMyBalance = catchAsync(async (req: Request, res: Response) => {

  const user = req.user as JwtPayload;


  if (!user || !user.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized access");
  }

  const result = await WalletService.getMyBalance(user.userId.toString());

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Balance retrieved successfully",
    data: result,
  });
});

// User + Agent  Wallet Operations  

const addMoney = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  if (!user.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized access");
  }

  const { amount, receiverWalletId } = req.body;

  // basic guard (Zod থাকলে middleware-এ হবে, তবুও safety)
  if (!amount || !receiverWalletId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Amount and receiverWalletId are required",
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

const sendMoney = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  // Auth check
  if (!user || !user.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized access");
  }

  const { amount, senderWalletId, receiverWalletId } = req.body;

  // Basic validation (Zod থাকলে middleware-এ হবে)
  if (!amount || !senderWalletId || !receiverWalletId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "amount, senderWalletId and receiverWalletId are required",
    );
  }

  // Prevent self-transfer (extra safety)
  if (senderWalletId === receiverWalletId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Cannot send money to your own wallet",
    );
  }

  const payload = {
    amount,
    senderWalletId,
    receiverWalletId,
    userId: user.userId.toString(),
  };

  // Service call
  const result = await WalletService.sendMoney(payload);

  // Response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Money sent successfully",
    data: result,
  });
});

const withdraw = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  if (!user || !user.userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized access");
  }

  const { amount, senderWalletId } = req.body;

  if (!amount || !senderWalletId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "amount and senderWalletId are required",
    );
  }

  const payload = {
    amount,
    senderWalletId,
    userId: user.userId.toString(),
  };

  const result = await WalletService.withdraw(payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Withdraw successful",
    data: result,
  });
});


// Agent Wallet Operations 

 const cashIn = catchAsync(async (req, res) => {

  const user = req.user as JwtPayload

  const { amount, agentWalletId, userWalletId } = req.body;

  const result = await WalletService.cashIn({
    amount,
    agentWalletId,
    userWalletId,
    userId: user.userId.toString(),
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Cash-in successful",
    data: result,
  });
});



export const WalletController = {
  
  getMyWallet,
  getMyBalance,

  // User + Agent Wallet Operations
  addMoney,
  sendMoney,
  withdraw,

  // Agent Wallet Operation
  cashIn
};
