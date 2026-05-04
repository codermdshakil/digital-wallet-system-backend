/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHandlers/AppError";
import { Transaction } from "./transaction.model";

const getMyTransactions = async (
  userId: string,
  userWalletId: string,
  query: any
) => {
  const { page = 1, limit = 10, type, status } = query;

  const filter: any = {
    $or: [
      { initiatedBy: userId },
      { senderWalletId: userWalletId },
      { receiverWalletId: userWalletId },
    ],
  };

  if (type) filter.type = type;
  if (status) filter.status = status;

  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await Transaction.countDocuments(filter);

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data: transactions,
  };
};

const getSingleTransaction = async (
  transactionId: string,
  userId: string,
  userWalletId: string
) => {
  
  const txn = await Transaction.findById(transactionId);

  if (!txn) {
    throw new AppError(404, "Transaction not found");
  }

  // 🔐 Ownership check
  const isOwner =
    txn.initiatedBy.toString() === userId ||
    txn.senderWalletId?.toString() === userWalletId ||
    txn.receiverWalletId?.toString() === userWalletId;

  if (!isOwner) {
    throw new AppError(403, "Forbidden access");
  }

  return txn;
};

export const TransactionService = {
  getMyTransactions,
  getSingleTransaction

  
}