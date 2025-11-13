import { Router } from "express";
import { AuthController } from "./auth.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";

const router = Router();
// USER LOGIN 
router.post("/login", AuthController.userLogIn);
// USER REFRESH TOKEN 
router.post('/refresh-token',
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
    AuthController.refreshToken)
//USER CHANGE PASSWORD
router.post('/change-password',
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
    AuthController.changePassword)
// USER FORGOT PASSWORD 
router.post("/forgot-password", AuthController.forgotPassword)
// USER RESET PASSWORD 
router.post("/reset-password", AuthController.resetPassword)
//USER LOGOUT
router.post("/logout", AuthController.userLogOut);

export const AuthRouter = router;
