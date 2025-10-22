import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserService } from "./user.service";

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

export const UserController = {
  createPatient,
};
