import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import AppError from "../../errorHandlers/AppError";
import { TransactionStatus, TransactionType } from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { Wallet } from "./wallet.model";


 
const addMoney = async (payload: {
  amount: number;
  receiverWalletId: string;
  userId: string;
}) => {
  const { amount, receiverWalletId, userId } = payload;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const wallet = await Wallet.findById(receiverWalletId).session(session);

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.status !== "ACTIVE") {
      throw new Error("Wallet is blocked");
    }

    if (wallet.userId.toString() !== userId) {
      throw new Error("Unauthorized wallet access");
    }

    // 💰 Update balance
    wallet.balance += amount;
    await wallet.save({ session });

    // 🧾 Create transaction
    const transaction = await Transaction.create(
      [
        {
          type: TransactionType.ADD_MONEY,
          amount,
          receiverWalletId: wallet._id,
          initiatedBy: userId,
          status: TransactionStatus.SUCCESS,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      wallet,
      transaction: transaction[0],
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const sendMoney = async (payload: {
  amount: number;
  senderWalletId: string;
  receiverWalletId: string;
  userId: string;
}) => {
  const { amount, senderWalletId, receiverWalletId, userId } = payload;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Fetch wallets
    const senderWallet = await Wallet.findById(senderWalletId).session(session);
    const receiverWallet = await Wallet.findById(receiverWalletId).session(session);

    if (!senderWallet) {
      throw new AppError(StatusCodes.NOT_FOUND, "Sender wallet not found");
    }

    if (!receiverWallet) {
      throw new AppError(StatusCodes.NOT_FOUND, "Receiver wallet not found");
    }

    // 2. Ownership check
    if (senderWallet.userId.toString() !== userId) {
      throw new AppError(StatusCodes.FORBIDDEN, "Unauthorized wallet access");
    }

    // 3. Status check
    if (senderWallet.status !== "ACTIVE") {
      throw new AppError(StatusCodes.BAD_REQUEST, "Sender wallet is blocked");
    }

    if (receiverWallet.status !== "ACTIVE") {
      throw new AppError(StatusCodes.BAD_REQUEST, "Receiver wallet is blocked");
    }

    // 4. Fee calculation (example)
    const fee = Math.floor(amount * 0.01); // 1% fee
    const totalDeduct = amount + fee;

    // 5. Balance check
    if (senderWallet.balance < totalDeduct) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Insufficient balance");
    }

    // 💸 6. Update balances
    senderWallet.balance -= totalDeduct;
    receiverWallet.balance += amount;

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    // 🧾 7. Create transaction
    const transaction = await Transaction.create(
      [
        {
          type: TransactionType.SEND_MONEY,
          amount,
          fee,
          senderWalletId: senderWallet._id,
          receiverWalletId: receiverWallet._id,
          initiatedBy: userId,
          status: TransactionStatus.SUCCESS,
        },
      ],
      { session }
    );

    // 8. Commit
    await session.commitTransaction();
    session.endSession();

    return {
      senderWallet,
      receiverWallet,
      transaction: transaction[0],
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const WalletService = {
  addMoney,
  sendMoney
}