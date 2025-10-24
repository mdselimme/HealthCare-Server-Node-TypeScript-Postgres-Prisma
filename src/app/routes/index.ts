import { Router } from "express";
import { UserRouter } from "../modules/user/user.routes";
import { AuthRouter } from "../modules/auth/auth.route";
import { ScheduleRouter } from "../modules/schedule/schedule.route";
import { DoctorScheduleRouter } from "../modules/doctorSchedule/doctorSchedule.route";
import { SpecialtiesRouter } from "../modules/specialities/specialities.route";

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
    path: '/specialties',
    route: SpecialtiesRouter
  },
];

moduleRoutes.forEach((item) => {
  router.use(item.path, item.route);
});

export default router;
