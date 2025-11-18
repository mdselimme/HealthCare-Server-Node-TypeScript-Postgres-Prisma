
import { Router } from "express";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { validZodSchemaRequest } from "../../middlewares/validZodSchemaRequest";
import { createDoctorScheduleZodSchema } from "./doctorSchedule.validation";


const router = Router();

// CREATE DOCTOR SCHEDULE 
router.post("/",
    checkAuth(UserRole.DOCTOR),
    validZodSchemaRequest(createDoctorScheduleZodSchema),
    DoctorScheduleController.createDoctorSchedule
);

// GET SCHEDULE ALL DOCTOR
router.get("/",
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR),
    DoctorScheduleController.doctorScheduleAll
);

// GET MY SCHEDULE ROUTE 
router.get("/my-schedule",
    checkAuth(UserRole.DOCTOR),
    DoctorScheduleController.getMySchedule
);

// DELETE SCHEDULE ALL DOCTOR
router.delete("/:id",
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR),
    DoctorScheduleController.deleteDoctorSchedule
);

export const DoctorScheduleRouter = router;