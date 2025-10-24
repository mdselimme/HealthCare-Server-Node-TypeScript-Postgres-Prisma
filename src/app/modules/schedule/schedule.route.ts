import { Router } from "express";
import { ScheduleController } from "./schdule.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";

const router = Router();

// CREATE DOCTOR SCHEDULE 
router.post("/", ScheduleController.scheduleCreate);
//GET ALL DOCTOR
router.get("/",
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR),
    ScheduleController.doctorScheduleAll);

router.delete("/:id", ScheduleController.deleteDoctorSchedule);

export const ScheduleRouter = router;