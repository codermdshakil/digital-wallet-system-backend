import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const addMoney = catchAsync(async (req: Request, res: Response) => {


  const user = req.user;

  // const payload ={

  // }

  // const result = await WalletService.addMoney();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Money Added Successfully",
    // data:result
  });
});

export const WalletController = {
  addMoney,
};
