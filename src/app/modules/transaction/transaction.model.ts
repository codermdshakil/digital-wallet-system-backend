import { model, Schema } from "mongoose";
import { getTransactionId } from "../../utils/getTransactionId";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "./transaction.interface";

export const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },

    transactionId: {
      type: String,
      unique: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than 0"],
    },

    fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    commission: {
      type: Number,
      default: 0,
      min: 0,
    },

    senderWalletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },

    receiverWalletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },

    initiatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

transactionSchema.pre("save", async function () {
  if (!this.transactionId) {
    this.transactionId = getTransactionId();
  }
});

export const Transaction = model<ITransaction>("Transaction",transactionSchema);
