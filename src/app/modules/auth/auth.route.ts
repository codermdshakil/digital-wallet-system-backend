import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { envVars } from "../../config/env";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { AuthController } from "./auth.controller";



const router = Router();

// Auth
router.post("/login", AuthController.credentialsLogin);
router.post("/logout", AuthController.logout);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/change-password", checkAuth(...Object.values(Role)) ,AuthController.changePassword);
router.post("/set-password", checkAuth(...Object.values(Role)) ,AuthController.setPassword);
// router.post("/forget-password",AuthController.forgetPassword);
router.post("/reset-password", checkAuth(...Object.values(Role)), AuthController.resetPassword);



// Google Login
router.get("/google", async(req:Request, res:Response, next:NextFunction) => {
  const redirect = req.query.redirect || "";
  passport.authenticate("google", {scope:["profile", "email"], state:redirect as string})(req,res, next)
});

router.get("/google/callback", passport.authenticate("google", {failureRedirect:`${envVars.FRONTEND_URL}/login?error=Threre are some issue with your account. Please contact with our support team!`}), AuthController.googleCallbackController)



export const AuthRoutes = router;
