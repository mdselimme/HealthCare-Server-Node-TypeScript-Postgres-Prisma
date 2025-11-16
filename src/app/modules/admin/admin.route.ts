import { Router } from "express";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { AdminController } from "./admin.controller";


const router = Router();

// GET ALL ADMIN DATA 
router.get("/",
    checkAuth(UserRole.ADMIN),
    AdminController.getAllAdminData
);

// GET ADMIN DATA BY ID 
router.get("/:id",
    checkAuth(UserRole.ADMIN),
    AdminController.getAdminById
);


export const AdminRouter = router;