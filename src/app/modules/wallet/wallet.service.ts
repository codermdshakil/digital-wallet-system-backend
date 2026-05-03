import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import AppError from "../../errorHandlers/AppError";
import {
  TransactionStatus,
  TransactionType,
} from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { Wallet } from "./wallet.model";

// User Wallet

// get wallet
const getMyWallet = async (userId: string) => {
  const wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    throw new AppError(StatusCodes.NOT_FOUND, "Wallet not found");
  }

  if (wallet.status !== "ACTIVE") {
    throw new AppError(StatusCodes.BAD_REQUEST, "Wallet is blocked");
  }

  return wallet;
};

// check balance
const getMyBalance = async (userId: string) => {
  const wallet = await Wallet.findOne({ userId }).select("balance status");

  if (!wallet) {
    throw new AppError(StatusCodes.NOT_FOUND, "Wallet not found");
  }

  if (wallet.status !== "ACTIVE") {
    throw new AppError(StatusCodes.BAD_REQUEST, "Wallet is blocked");
  }

  return {
    balance: wallet.balance,
  };
};

//  User + Agent  Wallet Operations

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
      { session },
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
    const receiverWallet =
      await Wallet.findById(receiverWalletId).session(session);

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
      { session },
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

const withdraw = async (payload: {
  amount: number;
  senderWalletId: string;
  userId: string;
}) => {
  const { amount, senderWalletId, userId } = payload;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Fetch wallet
    const wallet = await Wallet.findById(senderWalletId).session(session);

    if (!wallet) {
      throw new AppError(StatusCodes.NOT_FOUND, "Wallet not found!");
    }

    // 2. Ownership check
    if (wallet.userId.toString() !== userId) {
      throw new AppError(StatusCodes.FORBIDDEN, "Unauthorized wallet access");
    }

    // 3. Status check
    if (wallet.status !== "ACTIVE") {
      throw new AppError(StatusCodes.BAD_REQUEST, "Wallet is blocked");
    }

    // 4. Fee calculation (example: 1%)
    const fee = Math.floor(amount * 0.01);
    const totalDeduct = amount + fee;

    // 5. Balance check
    if (wallet.balance < totalDeduct) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Insufficient balance");
    }

    // 6. Update balance
    wallet.balance -= totalDeduct;
    await wallet.save({ session });

    // 7. Create transaction
    const transaction = await Transaction.create(
      [
        {
          type: TransactionType.WITHDRAW,
          amount,
          fee,
          senderWalletId: wallet._id,
          initiatedBy: userId,
          status: TransactionStatus.SUCCESS,
        },
      ],
      { session },
    );

    // ✅ 8. Commit
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

// Agent  Wallet Operations

const cashIn = async (payload: {
  amount: number;
  agentWalletId: string;
  userWalletId: string;
  userId: string;
}) => {
  const { amount, agentWalletId, userWalletId, userId } = payload;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const agentWallet = await Wallet.findById(agentWalletId).session(session);
    const userWallet = await Wallet.findById(userWalletId).session(session);

    if (!agentWallet || !userWallet) {
      throw new AppError(404, "Wallet not found");
    }

    if (agentWallet.userId.toString() !== userId) {
      throw new AppError(403, "Unauthorized agent wallet");
    }

    if (agentWallet.status !== "ACTIVE" || userWallet.status !== "ACTIVE") {
      throw new AppError(400, "Wallet blocked");
    }

    if (agentWallet.balance < amount) {
      throw new AppError(400, "Agent has insufficient balance");
    }

    // Update balances
    agentWallet.balance -= amount;
    userWallet.balance += amount;

    await agentWallet.save({ session });
    await userWallet.save({ session });

    // 🧾 Transaction
    const txn = await Transaction.create(
      [
        {
          type: TransactionType.CASH_IN,
          amount,
          senderWalletId: agentWallet._id,
          receiverWalletId: userWallet._id,
          initiatedBy: userId,
          status: TransactionStatus.SUCCESS,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return { agentWallet, userWallet, transaction: txn[0] };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const cashOut = async (payload: {
  amount: number;
  agentWalletId: string;
  userWalletId: string;
  userId: string;
}) => {
  const { amount, agentWalletId, userWalletId, userId } = payload;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const agentWallet = await Wallet.findById(agentWalletId).session(session);
    const userWallet = await Wallet.findById(userWalletId).session(session);

    if (!agentWallet || !userWallet) {
      throw new AppError(404, "Wallet not found");
    }

    if (agentWallet.userId.toString() !== userId) {
      throw new AppError(403, "Unauthorized agent wallet");
    }

    if (agentWallet.status !== "ACTIVE" || userWallet.status !== "ACTIVE") {
      throw new AppError(400, "Wallet blocked");
    }

    // CASHOUT FEE CALCULATION
    const fee = Math.round(
      Math.floor(amount / 1000) * 20 + (amount % 1000) * 0.02,
    );

    const totalDeduct = amount + fee;

    // balance check (VERY IMPORTANT)
    if (userWallet.balance < totalDeduct) {
      throw new AppError(400, `Insufficient balance. Required: ${totalDeduct}`);
    }

    // Update balances
    userWallet.balance -= totalDeduct;
    agentWallet.balance += amount; // agent gets only amount

    await userWallet.save({ session });
    await agentWallet.save({ session });

    // Transaction
    const txn = await Transaction.create(
      [
        {
          type: TransactionType.CASH_OUT,
          amount,
          fee, // ✅ store fee
          senderWalletId: userWallet._id,
          receiverWalletId: agentWallet._id,
          initiatedBy: userId,
          status: TransactionStatus.SUCCESS,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return {
      agentWallet,
      userWallet,
      fee,
      totalDeduct,
      transaction: txn[0],
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export const WalletService = {
  // User Wallet
  getMyWallet,
  getMyBalance,

  // Wallet Operations (User)
  addMoney,
  sendMoney,
  withdraw,

  // Agent wallet Operations
  cashIn,
  cashOut,
};
