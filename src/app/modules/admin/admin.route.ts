import { Router } from "express";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { AdminController } from "./admin.controller";


const router = Router();

router.get("/",
    checkAuth(UserRole.ADMIN),
    AdminController.getAllAdminData
)

export const AdminRouter = router;