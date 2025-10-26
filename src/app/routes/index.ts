import { Router } from "express";
import { UserRouter } from "../modules/user/user.routes";
import { AuthRouter } from "../modules/auth/auth.route";
import { ScheduleRouter } from "../modules/schedule/schedule.route";
import { DoctorScheduleRouter } from "../modules/doctorSchedule/doctorSchedule.route";
import { SpecialtiesRouter } from "../modules/specialities/specialities.route";
import { DoctorRouter } from "../modules/doctor/doctor.route";
import { AppointmentRouter } from "../modules/appointment/appointment.route";
import { PrescriptionRouter } from "../modules/prescription/prescription.route";
import { ReviewRouter } from "../modules/review/review.route";
import { PatientRouter } from "../modules/patient/patient.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRouter,
  },
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/schedule",
    route: ScheduleRouter,
  },
  {
    path: "/doctor-schedule",
    route: DoctorScheduleRouter,
  },
  {
    path: "/specialties",
    route: SpecialtiesRouter,
  },
  {
    path: "/doctor",
    route: DoctorRouter,
  },
  {
    path: "/patient",
    route: PatientRouter,
  },
  {
    path: "/appointment",
    route: AppointmentRouter,
  },
  {
    path: "/prescription",
    route: PrescriptionRouter,
  },
  {
    path: "/review",
    route: ReviewRouter,
  },
];

moduleRoutes.forEach((item) => {
  router.use(item.path, item.route);
});

export default router;
