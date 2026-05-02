import { Types } from "mongoose";


export enum Status {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IWallet {
  _id?: Types.ObjectId;      
  userId: Types.ObjectId;      // reference to User
  balance: number;             // current balance
  status: Status;              // balance
  createdAt?: Date;
  updatedAt?: Date;            // recommended for tracking changes
}