import { Router } from "express";
import { UserController } from "./user.controller";
import { fileUploader } from "../../helpers/multer.helper";
import {
  createAdminZodSchema,
  createDoctorValidationZodSchema,
  createUserValidationZodSchema,
} from "./user.validation";
import { validZodSchemaRequest } from "../../middlewares/validZodSchemaRequest";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";

const router = Router();

// GET ALL USER 
router.get(
  "/",
  checkAuth(UserRole.ADMIN),
  UserController.getAllUser
);

// GET ME USER 
router.get('/me',
  checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  UserController.getMeUserFromDb
)

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

//CREATE ADMIN
router.post(
  "/create-admin",
  fileUploader.upload.single("file"),
  validZodSchemaRequest(createAdminZodSchema),
  UserController.createUserAndAdmin
);

//UPDATE USER ROUTE
router.patch("/:id/status"
  , checkAuth(UserRole.ADMIN),
  UserController.updateUserStatus
)

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
