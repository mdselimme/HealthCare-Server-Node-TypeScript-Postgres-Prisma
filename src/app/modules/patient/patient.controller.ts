import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { PatientServices } from "./patient.service";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { IJwtPayload } from "../../interfaces/jwtPayload";

// GET PATIENT DATA
const getPatientData = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user;

  const result = await PatientServices.getPatientData(
    decodedToken as IJwtPayload
  );

  sendResponse(res, {
    success: true,
    message: "User Login Successfully",
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const PatientController = {
  getPatientData,
};
