import mongoose from "mongoose";
import { TransactionStatus, TransactionType } from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { Wallet } from "./wallet.model";


 
export const addMoney = async (payload: {
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

export const WalletService = {
  addMoney
}