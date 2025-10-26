import { Router } from "express";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { ReviewController } from "./review.controller";

const router = Router();

router.post(
  "/",
  checkAuth(UserRole.PATIENT),
  ReviewController.createDoctorReviews
);

export const ReviewRouter = router;
