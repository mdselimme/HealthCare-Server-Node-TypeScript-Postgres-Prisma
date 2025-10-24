import { Router } from "express"
import { DoctorController } from "./doctor.controller";

const router = Router();

router.get("/", DoctorController.getAllDoctorDB)

export const DoctorRouter = router;