import { Router } from "express";
import { UserController } from "./user.controller";
import { fileUploader } from "../../helpers/multer.helper";
import { createUserValidationZodSchema } from "./user.validation";
import { validZodSchemaRequest } from "../../middlewares/validZodSchemaRequest";

const router = Router();

router.get("/", UserController.getAllUser);

router.post(
  "/create-patient",
  fileUploader.upload.single("file"),
  validZodSchemaRequest(createUserValidationZodSchema),
  // (req: Request, res: Response, next: NextFunction) => {
  //   req.body = createUserValidationZodSchema.parse(
  //     JSON.stringify(req.body.data)
  //   );
  //   return UserController.createPatient(req, res, next);
  // }
  UserController.createPatient
);

export const UserRouter = router;
