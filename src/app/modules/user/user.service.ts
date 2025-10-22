import { Request } from "express";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import { IPatientInput } from "./user.interface";
import bcrypt from "bcryptjs";
import { fileUploader } from "../../helpers/multer.helper";
import { AppError } from "../../helpers/AppError";
import httpStatus from "http-status";

// CREATE PATIENT SERVICE FUNCTION
const createPatientService = async (req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.patient.profilePhoto = uploadResult?.secure_url;
  }

  const hashPassword = await bcrypt.hash(
    req.body.password,
    Number(config.bcrypt_salt_round)
  );

  const user = await prisma.user.findUnique({
    where: {
      email: req.body.patient.email,
    },
  });

  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email Already Exist.");
  }

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.patient.email,
        password: hashPassword,
      },
    });
    return await tnx.patient.create({
      data: req.body.patient,
    });
  });
  return result;
};

export const UserService = {
  createPatientService,
};
