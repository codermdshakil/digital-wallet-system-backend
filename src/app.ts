import express, { Request, Response } from "express";
import expressSession from "express-session";
import morgan from "morgan";
import passport from "passport";
import { envVars } from "./app/config/env";
import "./app/config/passport"; // correct path অনুযায়ী
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { handleNotFoundRoute } from "./app/middlewares/handleNotFoundRoute";
import { router } from "./app/routes";


const app = express();

app.use(expressSession({
  secret:envVars.EXPRESS_SESSION,
  resave:false,
  saveUninitialized:false
}));


app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({extended:true})) // this middleware for formdata

app.use("/api/v1", router);


app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
     success: true,
    message: "Welcome to Digital Wallet System Backend!",
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Okk!",
  });
});

// Not Found Route
app.use(handleNotFoundRoute);

// global error handler
app.use(globalErrorHandler)

export default app;
