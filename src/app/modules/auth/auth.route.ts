import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();
// USER LOGIN 
router.post("/login", AuthController.userLogIn);
//USER LOGOUT
router.post("/logout",)

export const AuthRouter = router;
