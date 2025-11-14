import { Router } from "express";
import { PrescriptionController } from "./prescription.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { PatientController } from "../patient/patient.controller";

const router = Router();

// CREATE PRESCRIPTION ROUTE
router.post(
  "/",
  checkAuth(UserRole.DOCTOR),
  PrescriptionController.createPrescription
);

// GET PRESCRIPTIONS BY PATIENT 
router.get(
  "/my-prescription",
  checkAuth(UserRole.PATIENT),
  PrescriptionController.getPrescriptionsByPatient
);

export const PrescriptionRouter = router;
