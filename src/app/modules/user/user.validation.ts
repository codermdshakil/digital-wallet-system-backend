import z from "zod";
import { AgentApprovalStatus, IsActive, Role } from "./user.interface";

/** 🧑 Create User */
export const createUserZodSchema = z.object({
  name: z
    .string({ message: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),

  email: z
    .string({ message: "Email must be string" })
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),

  password: z
    .string({ message: "Password must be string" })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    })
    .optional(), // optional for OAuth

  phone: z
    .string({ message: "Phone must be string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message: "Phone must be valid BD number (+8801XXXXXXXXX or 01XXXXXXXXX)",
    })
    .optional(),

  picture: z.string().optional(),
  nidPhoto: z.string().optional(),

  address: z.string({ message: "Address must be string" }).max(200).optional(),

  role: z.enum(Object.values(Role) as [string]).optional(),

  isActive: z.enum(Object.values(IsActive) as [string]).optional(),

  isDeleted: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  wallet: z.string().optional(),

  /** 🧾 Agent Fields */
  agentApprovalStatus: z
    .enum(Object.values(AgentApprovalStatus) as [string])
    .optional(),

  commissionRate: z
    .number()
    .min(0, { message: "Commission cannot be negative" })
    .max(100, { message: "Commission cannot exceed 100%" })
    .optional(),
});

export const updateUserZodSchema = z.object({
  name: z.string({ message: "Name must be string" }).min(2).max(50).optional(),

  email: z
    .string({ message: "Email must be string" })
    .email()
    .min(5)
    .max(100)
    .optional(),

  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[A-Z])/)
    .regex(/^(?=.*[!@#$%^&*])/)
    .regex(/^(?=.*\d)/)
    .optional(),

  phone: z
    .string()
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message: "Invalid BD phone number",
    })
    .optional(),

  picture: z.string().url().optional(),
  nidPhoto: z.string().url().optional(),

  address: z.string().max(200).optional(),

  role: z.enum(Object.values(Role) as [string]).optional(),

  isActive: z.enum(Object.values(IsActive) as [string]).optional(),

  isDeleted: z.boolean().optional(),
  isVerified: z.boolean().optional(),

  agentApprovalStatus: z
    .enum(Object.values(AgentApprovalStatus) as [string])
    .optional(),

  commissionRate: z.number().min(0).max(100).optional(),
});
