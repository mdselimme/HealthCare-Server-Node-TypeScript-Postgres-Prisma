import { Router } from "express";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { PatientController } from "./patient.controller";

const router = Router();

// GET PATIENT DATA ROUTE
router.get("/",
    checkAuth(UserRole.ADMIN),
    PatientController.getAllPatientData);

// GET PATIENT BY ID 
router.get("/:id",
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR),
    PatientController.getPatientById);

//SOFT DELETE PATIENT ROUTE
router.delete("/soft/:id",
    checkAuth(UserRole.ADMIN),
    PatientController.softDeletePatient);

export const PatientRouter = router;
