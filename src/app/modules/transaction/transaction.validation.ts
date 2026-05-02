import z from "zod";
import { objectIdSchema } from "../../helpers/objectIdValidator";
import { TransactionType } from "./transaction.interface";

export const createTransactionZodSchema = z.object({
  type: z
    .enum(Object.values(TransactionType) as [string], {
      message: "Transaction type is required",
    }),

  amount: z
    .number({ message: "Amount must be number" })
    .min(1, { message: "Amount must be greater than 0" }),

  fee: z
    .number({ message: "Fee must be number" })
    .min(0, { message: "Fee cannot be negative" })
    .optional(),

  commission: z
    .number({ message: "Commission must be number" })
    .min(0, { message: "Commission cannot be negative" })
    .optional(),

  senderWalletId: objectIdSchema.optional(),
  receiverWalletId: objectIdSchema.optional(),
});

export const updateTransactionZodSchema = z.object({
  
  type: z.enum(Object.values(TransactionType) as [string]).optional(),

  amount: z
    .number({ message: "Amount must be number" })
    .min(1, { message: "Amount must be greater than 0" })
    .optional(),

  fee: z
    .number({ message: "Fee must be number" })
    .min(0, { message: "Fee cannot be negative" })
    .optional(),

  commission: z
    .number({ message: "Commission must be number" })
    .min(0, { message: "Commission cannot be negative" })
    .optional(),

  senderWalletId: objectIdSchema.optional(),
  receiverWalletId: objectIdSchema.optional(),
});
