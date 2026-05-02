/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import bcryptjs from "bcrypt";
import mongoose from "mongoose";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { IsActive, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { Wallet } from "../modules/wallet/wallet.model";
import { envVars } from "./env";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const isUserExist = await User.findOne({ email });

        if (!isUserExist) {
          return done(null, false, { message: "User does not Exist!!" });
        }

        if (
          isUserExist &&
          (isUserExist.isActive === IsActive.BLOCKED ||
            isUserExist.isActive === IsActive.INACTIVE)
        ) {
          return done(null, false, {
            message: `User is ${isUserExist.isActive}!!`,
          });
        }

        if (isUserExist.isDeleted) {
          return done(null, false, { message: "User is Deleted!!" });
        }

        if (!isUserExist.isVerified) {
          return done(null, false, { message: "User is not verified!!" });
        }

        // check user google authenticated
        const isGoogleAuthenticated = isUserExist.auths.some(
          (providerObjects) => providerObjects.provider == "google",
        );

        if (isGoogleAuthenticated && !isUserExist.password) {
          return done(null, false, {
            message:
              "You have authenticated through Google. SO, if you want to login with credentials, then at first login with Google and set a password with your Gmail and then you can login using Email and Password!!",
          });
        }

        const isPasswordMatched = await bcryptjs.compare(
          password as string,
          isUserExist.password as string,
        );

        if (!isPasswordMatched) {
          return done(null, false, { message: "Password does not Matched!" });
        }

        // check if usre is google authenticated then show warning

        return done(null, isUserExist);
      } catch (error) {
        console.log(error);
        done(error);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID as string,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET as string,
      callbackURL: envVars.GOOGLE_CALLBACK_URL as string,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        const email = profile.emails?.[0].value;


        if (!email) {
          await session.abortTransaction();
          session.endSession();
          return done(null, false, { message: "No Email found!" });
        }

        let user = await User.findOne({ email }).session(session);

        /* =========================
           🟢 CREATE USER + WALLET
        ========================= */
        if (!user) {
          const createdUser = await User.create(
            [
              {
                email,
                name: profile.displayName,
                picture: profile.photos?.[0].value,
                role: Role.USER,
                isVerified: true,
                auths: [
                  {
                    provider: "google",
                    providerId: profile.id,
                  },
                ],
                wallet: null,
              },
            ],
            { session },
          );

          const wallet = await Wallet.create(
            [
              {
                userId: createdUser[0]._id,
                balance: 50, // default wallet balance
              },
            ],
            { session },
          );

          user = await User.findByIdAndUpdate(
            createdUser[0]._id,
            { wallet: wallet[0]._id },
            { returnDocument: "after", session },
          ).populate("wallet");
        }

        /* =========================
           🔴 VALIDATION CHECKS
        ========================= */

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        if (
          user.isActive === IsActive.BLOCKED ||
          user.isActive === IsActive.INACTIVE
        ) {
          await session.abortTransaction();
          session.endSession();

          return done(null, false, {
            message: `User is ${user.isActive}!`,
          });
        }

        if (user.isDeleted) {
          await session.abortTransaction();
          session.endSession();

          return done(null, false, {
            message: "User is Deleted!",
          });
        }

        if (!user.isVerified) {
          await session.abortTransaction();
          session.endSession();

          return done(null, false, {
            message: "User is not verified!",
          });
        }

        /* =========================
           🟢 COMMIT SUCCESS
        ========================= */
        await session.commitTransaction();
        session.endSession();

        return done(null, user);
      } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.log("Google strategy error:", error);
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.log(error, "from passport config");
    done(error);
  }
});
