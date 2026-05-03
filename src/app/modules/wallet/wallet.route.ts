import { Router } from "express";
import { WalletController } from "./wallet.controller";

const router = Router();

// add-money
// sent-money
// withdew-money

// Agent
// cash-in
// cash-out


router.post("/add-money", WalletController.addMoney)





export const WalletRoutes = router;


