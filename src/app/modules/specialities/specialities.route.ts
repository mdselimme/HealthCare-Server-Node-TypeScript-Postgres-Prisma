import { UserRole } from "@prisma/client";
import { Router } from "express";
import checkAuth from "../../middlewares/checkAuth";
import { fileUploader } from "../../helpers/multer.helper";
import { SpecialtiesController } from "./specialities.controller";
import { validZodSchemaRequest } from "../../middlewares/validZodSchemaRequest";
import { createSpecialityZodSchema } from "./specialities.validation";

const router = Router();


// Task 1: Retrieve Specialties Data

/**
- Develop an API endpoint to retrieve all specialties data.
- Implement an HTTP GET endpoint returning specialties in JSON format.
- ENDPOINT: /specialties
*/
router.get(
    '/',
    SpecialtiesController.getSpecialityAll
);

router.post(
    '/',
    fileUploader.upload.single('file'),
    validZodSchemaRequest(createSpecialityZodSchema),
    SpecialtiesController.createSpeciality
);



// Task 2: Delete Specialties Data by ID

/**
- Develop an API endpoint to delete specialties by ID.
- Implement an HTTP DELETE endpoint accepting the specialty ID.
- Delete the specialty from the database and return a success message.
- ENDPOINT: /specialties/:id
*/

router.delete(
    '/:id',
    checkAuth(UserRole.ADMIN),
    SpecialtiesController.deleteSpeciality
);

export const SpecialtiesRouter = router;