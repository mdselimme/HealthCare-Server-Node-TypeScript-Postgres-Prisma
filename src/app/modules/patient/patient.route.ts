import { Router } from "express";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { PatientController } from "./patient.controller";

const router = Router();

// GET PATIENT DATA ROUTE
router.get("/", checkAuth(UserRole.PATIENT), PatientController.getPatientData);

export const PatientRouter = router;
