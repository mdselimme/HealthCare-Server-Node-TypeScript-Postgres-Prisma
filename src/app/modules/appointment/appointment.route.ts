import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";

const router = Router();

// CREATE APPOINTMENT
router.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.PATIENT),
  AppointmentController.createAnAppointment
);

export const AppointmentRouter = router;
