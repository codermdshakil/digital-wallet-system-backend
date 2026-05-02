import { Schema, model } from "mongoose";
import { AgentApprovalStatus, IUser, IsActive, Role } from "./user.interface";

/** Auth Provider Sub Schema */
const authProviderSchema = new Schema(
  {
    provider: {
      type: String,
      enum: ["google", "credentials"],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
  },
  {
    versionKey:false,
     _id: false 
  }
);

/**  User Schema */
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
    },

    phone: {
      type: String,
    },

    picture: {
      type: String,
    },

    nidPhoto: {
      type: String,
    },

    address: {
      type: String,
    },

    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },

    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    /** Auth Providers */
    auths: {
      type: [authProviderSchema],
      default: [],
    },

    /** Wallet relation (1:1) */
    wallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      default:null
    },

    /** Agent Fields */
    agentApprovalStatus: {
      type: String,
      enum: Object.values(AgentApprovalStatus),
    },

    commissionRate: {
      type: Number,
      min: 0,
      max: 100,
    },

  },
  {
    timestamps: true,
    versionKey:false
  }
);


/** Export Model */
export const User = model<IUser>("User", userSchema);