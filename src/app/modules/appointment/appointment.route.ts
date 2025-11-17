import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";

const router = Router();

// GET ALL APPOINTMENT 
router.get(
  "/",
  checkAuth(UserRole.ADMIN),
  AppointmentController.getAllAppointment
);


// GET MY APPOINTMENT
router.get(
  "/my-appointments",
  checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  AppointmentController.getMyAppointment
);

// CREATE APPOINTMENT
router.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.PATIENT),
  AppointmentController.createAnAppointment
);
// UPDATE APPOINTMENT
router.patch(
  "/status/:id",
  checkAuth(UserRole.ADMIN, UserRole.DOCTOR),
  AppointmentController.updateAppointmentStatus
);

export const AppointmentRouter = router;
