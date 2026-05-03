import { Types } from "mongoose";

/** Transaction Types */
export enum TransactionType {
  ADD_MONEY = "ADD_MONEY",
  SEND_MONEY = "SEND_MONEY",
  WITHDRAW = "WITHDRAW",
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
}

/** Transaction Status */
export enum TransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

/** Transaction Interface */
export interface ITransaction {
  _id?: Types.ObjectId;

  transactionId?: string;
  type: TransactionType;
  amount: number;
  fee?: number;
  commission?: number;
  senderWalletId?: Types.ObjectId;
  receiverWalletId?: Types.ObjectId;

  initiatedBy: Types.ObjectId;

  status: TransactionStatus;

  createdAt?: Date;
  updatedAt?: Date;
}
