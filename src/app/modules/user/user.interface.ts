import { Types } from "mongoose";

/** 🔐 Roles aligned with wallet system */
export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  AGENT = "AGENT",
}

/** 🔐 Account status */
export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

/** 🔐 Account status */
export enum AgentApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
}

/** 🔑 Auth Providers */
export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

/** 👤 Main User Interface */
export interface IUser {
  _id?: Types.ObjectId;

  name: string;
  email: string;
  password?: string; // optional for OAuth

  phone?: string;
  picture?: string;
  nidPhoto?: string;

  address?: string;

  role: Role;

  isActive: IsActive;
  isDeleted?: boolean;
  isVerified?: boolean;

  auths: IAuthProvider[];

  /** 🔗 Relations */
  wallet?: Types.ObjectId | null; // 1:1 wallet reference

  /** 🧾 Agent-specific fields (optional but important) */
  agentApprovalStatus?: AgentApprovalStatus;
  commissionRate?: number;

  createdAt?: Date;
  updatedAt?: Date;
}
