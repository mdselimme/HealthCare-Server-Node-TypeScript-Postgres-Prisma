import { Router } from "express";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { MetaDataController } from "./metadata.controller";

const router = Router();

router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  MetaDataController.fetchDashboardMetaData
);

export const MetadataRouter = router;
