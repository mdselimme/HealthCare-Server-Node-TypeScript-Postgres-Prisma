import { Router } from "express"
import { DoctorController } from "./doctor.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";

const router = Router();

// GET ALL DOCTORS 
router.get("/", DoctorController.getAllDoctorDB)
// UPDATE DOCTOR 
router.patch("/", checkAuth(UserRole.DOCTOR),
    DoctorController.updateDoctor
)
export const DoctorRouter = router;