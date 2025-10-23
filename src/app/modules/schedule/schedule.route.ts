import { Router } from "express";
import { ScheduleController } from "./schdule.controller";

const router = Router();

// CREATE DOCTOR SCHEDULE 
router.post("/", ScheduleController.scheduleCreate);
//GET ALL DOCTOR
router.get("/", ScheduleController.doctorScheduleAll);

export const ScheduleRouter = router;