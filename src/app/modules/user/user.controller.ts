import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserService } from "./user.service";
import { searchQuery } from "../../helpers/searchQuery";
import { IJwtPayload } from "../../interfaces/jwtPayload";

// CREATE PATIENT
const createPatient = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createPatientService(req);

  sendResponse(res, {
    success: true,
    message: "Patient Created Successfully.",
    data: result,
    statusCode: httpStatus.CREATED,
  });
});

// CREATE DOCTOR
const createUserAndDoctor = catchAsync(async (req: Request, res: Response) => {

  const result = await UserService.createUserAndDoctorService(req);

  sendResponse(res, {
    success: true,
    message: "Doctor Created Successfully.",
    data: result,
    statusCode: httpStatus.CREATED,
  });
});

// CREATE ADMIN
const createUserAndAdmin = catchAsync(async (req: Request, res: Response) => {

  const result = await UserService.createUserAndAdminService(req);

  sendResponse(res, {
    success: true,
    message: "Admin Created Successfully.",
    data: result,
    statusCode: httpStatus.CREATED,
  });
});

// GET ME USER
const getMeUserFromDb = catchAsync(async (req: Request, res: Response) => {

  const decodedToken = req.user;

  const result = await UserService.getMeUserFromDb(decodedToken as IJwtPayload);

  sendResponse(res, {
    success: true,
    message: "Me User Retrieved Successfully.",
    data: result,
    statusCode: httpStatus.OK,
  });
});

// GET ALL USER
const getAllUser = catchAsync(async (req: Request, res: Response) => {

  const filters = searchQuery(req.query, [
    "status",
    "role",
    "email",
    "searchTerm",
  ]);
  const options = searchQuery(req.query, [
    "page",
    "limit",
    "sortField",
    "sortOrder",
  ]);

  const result = await UserService.getAllUserDb(filters, options);

  sendResponse(res, {
    success: true,
    message: "User Retrieved Successfully.",
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const UserController = {
  createPatient,
  getAllUser,
  createUserAndDoctor,
  createUserAndAdmin,
  getMeUserFromDb
};
