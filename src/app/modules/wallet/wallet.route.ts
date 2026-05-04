import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { WalletController } from "./wallet.controller";
import { cashInZodSchema, cashOutZodSchema, createAddMoneyZodSchema, sendMoneyZodSchema, withdrawZodSchema } from "./wallet.validation";

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


// User + Agent  Wallet Operations 

router.post(
  "/add-money",
  checkAuth(Role.USER, Role.AGENT),
  validateRequest(createAddMoneyZodSchema),
  WalletController.addMoney
);

router.post(
  "/send-money",
  checkAuth(Role.USER, Role.AGENT),
  validateRequest(sendMoneyZodSchema),
  WalletController.sendMoney
);


router.post(
  "/withdraw",
  checkAuth(Role.USER, Role.AGENT),
  validateRequest(withdrawZodSchema),
  WalletController.withdraw
);

// Agent Wallet Operations 
router.post(
  "/cash-in",
  checkAuth(Role.AGENT),
  validateRequest(cashInZodSchema),
  WalletController.cashIn
);

router.post(
  "/cash-out",
  checkAuth(Role.AGENT),
  validateRequest(cashOutZodSchema),
  WalletController.cashOut
);

// Admin wallet operations

router.patch(
  "/block/:id",
  checkAuth(Role.ADMIN),
  WalletController.blockWallet
);

router.patch(
  "/unblock/:id",
  checkAuth(Role.ADMIN),
  WalletController.unblockWallet
);

router.get(
  "/",
  checkAuth(Role.ADMIN),
  WalletController.getAllWallets
);







export const WalletRoutes = router;


