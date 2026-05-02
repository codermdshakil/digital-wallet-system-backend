import { model, Schema } from "mongoose";
import { IWallet, Status } from "./wallet.interface";

 
const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one wallet per user
    },
    balance: {
      type: Number,
      required: true,
      default: 50,
      min: 0, // prevents negative balance  
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.ACTIVE,
    },
  },
  {
    timestamps: true,
    versionKey:false
  }
);
 
// Create model
export const Wallet = model<IWallet>("Wallet", walletSchema);