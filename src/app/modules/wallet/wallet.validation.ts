import z from "zod";
import { objectIdSchema } from "../../helpers/objectIdValidator";
import { Status } from "./wallet.interface";

// Add money zod schema
export const createAddMoneyZodSchema = z.object({
  amount: z.number().min(1),
  receiverWalletId: z.string(),
});

// Send money zod schema
export const sendMoneyZodSchema = z.object({
    amount: z
      .number({ message: "Amount must be a number" })
      .min(1, { message: "Amount must be greater than 0" }),

    senderWalletId: objectIdSchema,
    receiverWalletId: objectIdSchema,
  })
  .refine((data) => data.senderWalletId !== data.receiverWalletId, {
    message: "Cannot send money to your own wallet",
    path: ["receiverWalletId"],
  });

// withdraw zod schema
export const withdrawZodSchema = z.object({
  amount: z
    .number({ message: "Amount must be a number" })
    .min(1, { message: "Amount must be greater than 0" }),
  senderWalletId: objectIdSchema,
});





export const createWalletZodSchema = z.object({
  balance: z.number().min(0, "Balance cannot be negative").optional(), // optional because default = 50 in schema
  status: z.enum(Object.values(Status) as [string]).optional(), // default = ACTIVE
});

export const updateWalletZodSchema = z.object({
  balance: z.number().min(0, "Balance cannot be negative").optional(),
  status: z.enum(Object.values(Status) as [string]).optional(),
});
