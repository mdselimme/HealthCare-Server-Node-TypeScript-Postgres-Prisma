import { Router } from "express";
import { UserController } from "./user.controller";
import { fileUploader } from "../../helpers/multer.helper";
import { createDoctorValidationZodSchema, createUserValidationZodSchema } from "./user.validation";
import { validZodSchemaRequest } from "../../middlewares/validZodSchemaRequest";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.DOCTOR),
  UserController.getAllUser
);
// CREATE PATIENT 
router.post(
  "/create-patient",
  fileUploader.upload.single("file"),
  validZodSchemaRequest(createUserValidationZodSchema),
  UserController.createPatient
);

//CREATE DOCTOR
router.post(
  "/create-doctor",
  fileUploader.upload.single("file"),
  validZodSchemaRequest(createDoctorValidationZodSchema),
  UserController.createUserAndDoctor
);

export const UserRouter = router;

/*
//User Validation another method when data have in form data
  (req: Request, res: Response, next: NextFunction) => {
    req.body = createUserValidationZodSchema.parse(
      JSON.stringify(req.body.data)
    );
    return UserController.createPatient(req, res, next);
  }
*/