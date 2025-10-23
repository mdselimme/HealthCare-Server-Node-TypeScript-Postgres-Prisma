
import { Router } from "express";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";


const router = Router();

// CREATE DOCTOR SCHEDULE 
router.post("/",
    checkAuth(UserRole.PATIENT
    ),
    DoctorScheduleController.createDoctorSchedule);
//GET ALL DOCTOR
// router.get("/",);

// router.delete("/:id",);

export const DoctorScheduleRouter = router;