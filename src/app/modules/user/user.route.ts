import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";


const router = Router();

// c - create 
// r - read
// u - update 
// d - delete
// all - all

router.post("/register", validateRequest(createUserZodSchema),UserController.createUser);
router.get("/:id", UserController.getSingleUser);
router.get("/", UserController.getAllUsers);
router.patch("/:id",validateRequest(updateUserZodSchema), UserController.updateUser);
router.delete("/:id", UserController.deleteUser);




export const UserRoutes = router;
