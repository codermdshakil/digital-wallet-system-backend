import z from "zod";
import { Status } from "./wallet.interface";


export const createAddMoneyZodSchema = z.object({
  amount: z.number().min(1),
  receiverWalletId: z.string(),
});


export const createWalletZodSchema = z.object({

  balance: z.number().min(0, "Balance cannot be negative").optional(), // optional because default = 50 in schema
  status: z.enum(Object.values(Status) as [string]).optional(),// default = ACTIVE

});

export const updateWalletZodSchema = z.object({

  balance: z.number().min(0, "Balance cannot be negative").optional(),
  status: z.enum(Object.values(Status) as [string]).optional(),

});
