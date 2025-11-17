import { Router } from "express";
import { DoctorController } from "./doctor.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";

const router = Router();

// GET ALL DOCTORS
router.get("/",
    DoctorController.getAllDoctorDB
);

// GET DOCTOR BY Id
router.get("/:id",
    DoctorController.getDoctorById
);

// UPDATE DOCTOR
router.patch("/",
    checkAuth(UserRole.DOCTOR),
    DoctorController.updateDoctor
);

// AI SUGGESTION
router.post("/suggestion",
    DoctorController.getAISuggestion
);

// SOFT DOCTOR DELETE BY ID ROUTE   
router.delete("/soft/:id",
    checkAuth(UserRole.ADMIN),
    DoctorController.softDeleteDoctorById
);

// DELETE DOCTOR BY ID ROUTE   
router.delete("/:id",
    checkAuth(UserRole.ADMIN),
    DoctorController.deleteDoctorById
);

export const DoctorRouter = router;
