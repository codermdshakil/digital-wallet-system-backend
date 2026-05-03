import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { WalletController } from "./wallet.controller";
import { createAddMoneyZodSchema, sendMoneyZodSchema, withdrawZodSchema } from "./wallet.validation";

const router = Router();

// add-money
// sent-money
// withdew-money

// Agent
// cash-in
// cash-out

// User Wallet

router.get(
  "/me",
  checkAuth(Role.USER, Role.ADMIN, Role.AGENT),
  WalletController.getMyWallet
);

router.get(
  "/balance",
  checkAuth(Role.USER, Role.ADMIN, Role.AGENT),
  WalletController.getMyBalance
);


// Wallet Operations (User)

router.post(
  "/add-money",
  checkAuth(Role.USER),
  validateRequest(createAddMoneyZodSchema),
  WalletController.addMoney
);

router.post(
  "/send-money",
  checkAuth(Role.USER),
  validateRequest(sendMoneyZodSchema),
  WalletController.sendMoney
);


router.post(
  "/withdraw",
  checkAuth(Role.USER),
  validateRequest(withdrawZodSchema),
  WalletController.withdraw
);





export const WalletRoutes = router;


