import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { TransactionController } from "./transaction.controller";

const router = Router();

router.get(
  "/me",
  checkAuth(Role.USER, Role.AGENT),
  TransactionController.getMyTransactions
);

router.get(
  "/:id",
  checkAuth(Role.USER, Role.AGENT),
  TransactionController.getSingleTransaction
);


export const TransactionRoutes = router;
