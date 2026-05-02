import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { envVars } from "../../config/env";
import AppError from "../../errorHandlers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Wallet } from "../wallet/wallet.model";
import { userSearchAbleFields } from "./user.constant";
import { IUser } from "./user.interface";
import { User } from "./user.model";

const createUser = async (payload: Partial<IUser>) => {
  // 1. Check existing user
  const existingUser = await User.findOne({ email: payload.email });

  if (existingUser) {
    // 2. Handle status-based logic
    if (existingUser.isActive === "BLOCKED") {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "This user is blocked. Please contact support.",
      );
    }

    if (existingUser.isActive === "INACTIVE") {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "This user is inactive. Please verify your account.",
      );
    }

    if (existingUser.isDeleted === true) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "This user is Deleted.");
    }

    // ACTIVE user
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "User with this email already exists!",
    );
  }

  if (payload.password) {
    // 3. Hash password
    const hashedPassword = await bcrypt.hash(
      payload.password as string,
      Number(envVars.BCRYPT_SALT),
    );

    // 4. Replace plain password with hashed password
    payload.password = hashedPassword as string;
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1. Create User WITHOUT wallet first
    const user = await User.create(
      [
        {
          ...payload,
          wallet: null, // temporary (we'll update later)
        },
      ],
      { session },
    );

    // 2. Create Wallet using userId
    const wallet = await Wallet.create(
      [
        {
          userId: user[0]._id,
          balance: 50, // default
        },
      ],
      { session },
    );

    // 3. Update User with wallet reference
    const updatedUser = await User.findByIdAndUpdate(
      user[0]._id,
      { wallet: wallet[0]._id },
      { returnDocument: "after", session },
    ).populate("wallet");
    await session.commitTransaction();
    session.endSession();

    return updatedUser;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }


};

const getAllUsers = async (query: Record<string, string>) => {

  const queryBuilder = new QueryBuilder(User.find().populate("wallet"), query);

  const users = await queryBuilder
    .search(userSearchAbleFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  // const meta = await queryBuilder.getMeta()

  const [data, meta] = await Promise.all([users.build(), users.getMeta()]);

  return {
    data,
    meta,
  };
};
const getSingleUser = async (id: string) => {
  const result = await User.findById(id).populate("wallet");

  if (!result || result.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }

  return result;
};

const updateUser = async (id: string, payload: Partial<IUser>) => {
  // Check if user exists and is not deleted
  const isUserExist = await User.findById(id);

  if (!isUserExist || isUserExist.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }

  if (payload.password) {
    // 3. Hash password
    const hashedPassword = await bcrypt.hash(
      payload.password as string,
      Number(envVars.BCRYPT_SALT),
    );

    // 4. Replace plain password with hashed password
    payload.password = hashedPassword as string;
  }

  const result = await User.findByIdAndUpdate(id, payload, {
    returnDocument: "after",
    runValidators: true,
  });

  return result;
};

const deleteUser = async (id: string) => {

  const isUserExist = await User.findById(id);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }

  // Best Practice: Use soft delete instead of permanent removal
  const result = await User.findByIdAndDelete(id);

  return result;
};

export const UserServices = {
  createUser,
  getSingleUser,
  updateUser,
  deleteUser,
  getAllUsers
};
