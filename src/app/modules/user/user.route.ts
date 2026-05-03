import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { Role } from "./user.interface";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";


const router = Router();

// c - create 
// r - read
// u - update 
// d - delete
// all - all

router.post("/register", validateRequest(createUserZodSchema), UserController.createUser);
router.get("/:id", UserController.getSingleUser);
router.get("/",checkAuth(Role.ADMIN), UserController.getAllUsers);
router.patch("/:id", validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)),UserController.updateUser);
router.delete("/:id", UserController.deleteUser);




export const UserRoutes = router;
