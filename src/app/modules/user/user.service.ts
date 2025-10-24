import { Request } from "express";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { AppError } from "../../helpers/AppError";
import httpStatus from "http-status";
import { calculatePagination } from "../../helpers/paginationHelpers";
import { Prisma, UserRole } from "@prisma/client";
import { userSearchableFields } from "./user.constant";
import { uploadImage } from "../../helpers/fileUploader";



//HASH PASSWORD FUNCTION
const hashPasswordFunc = async (password: string) => {
  const hashPass = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_round)
  );
  return hashPass;
};

// CREATE PATIENT SERVICE FUNCTION
const createPatientService = async (req: Request) => {
  if (req.file) {
    const imageUrl = await uploadImage(req);
    req.body.patient.profilePhoto = imageUrl;
  }

  const hashPassword = await hashPasswordFunc(req.body.password);

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

// CREATE DOCTOR SERVICE FUNCTION
const createUserAndDoctorService = async (req: Request) => {

  if (req.file) {
    const imageUrl = await uploadImage(req);
    req.body.doctor.profilePhoto = imageUrl;
  }

  const hashPassword = await hashPasswordFunc(req.body.password);

  const user = await prisma.user.findUnique({
    where: {
      email: req.body.doctor.email,
    },
  });

  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email Already Exist.");
  }

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.doctor.email,
        password: hashPassword,
        role: UserRole.DOCTOR
      },
    });
    return await tnx.doctor.create({
      data: req.body.doctor,
    });
  });
  return result;
};

// CREATE ADMIN SERVICE FUNCTION
const createUserAndAdminService = async (req: Request) => {

  if (req.file) {
    const imageUrl = await uploadImage(req);
    req.body.admin.profilePhoto = imageUrl;
  }

  const hashPassword = await hashPasswordFunc(req.body.password);

  const user = await prisma.user.findUnique({
    where: {
      email: req.body.admin.email,
    },
  });

  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email Already Exist.");
  }

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.admin.email,
        password: hashPassword,
        role: UserRole.ADMIN
      },
    });
    return await tnx.admin.create({
      data: req.body.admin,
    });
  });
  return result;
};

//GET ALL USERS
const getAllUserDb = async (params: any, options: any) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0
      ? {
        AND: andConditions,
      }
      : {};

  const result = await prisma.user.findMany({
    skip,
    take: limit,
    where: {
      AND: andConditions,
    },
    omit: {
      password: true,
    },
    orderBy:
      sortBy && sortOrder
        ? {
          [sortBy]: sortOrder,
        }
        : {
          createdAt: "desc",
        },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    result,
  };
};

export const UserService = {
  createUserAndDoctorService,
  createPatientService,
  getAllUserDb,
  createUserAndAdminService
};
