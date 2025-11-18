import { Router } from "express";
import { ScheduleController } from "./schdule.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";

const router = Router();

// CREATE DOCTOR SCHEDULE 
router.post("/",
    checkAuth(UserRole.ADMIN),
    ScheduleController.scheduleCreate);
//GET ALL SCHEDULE
router.get("/",
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR),
    ScheduleController.doctorScheduleAll);
// DELETE SCHEDULE 
router.delete("/:id",
    checkAuth(UserRole.ADMIN),
    ScheduleController.deleteDoctorSchedule);

export const ScheduleRouter = router;