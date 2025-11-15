import { Router } from "express";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { PatientController } from "./patient.controller";

const router = Router();

// GET PATIENT DATA ROUTE
router.get("/",
    checkAuth(UserRole.PATIENT),
    PatientController.getPatientData);

//SOFT DELETE PATIENT ROUTE
router.delete("/soft/:id",
    checkAuth(UserRole.ADMIN),
    PatientController.softDeletePatient);

export const PatientRouter = router;
