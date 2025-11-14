import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { PrescriptionService } from "./prescription.service";
import { IJwtPayload } from "../../interfaces/jwtPayload";
import { searchQuery } from "../../helpers/searchQuery";

const createPrescription = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user;

  const result = await PrescriptionService.createPrescription(
    decodedToken as IJwtPayload,
    req.body
  );

  sendResponse(res, {
    success: true,
    message: "Ai doctors suggestion find Successfully.",
    data: result,
    statusCode: httpStatus.OK,
  });
});

// GET PRESCRIPTION BY PATIENT 
const getPrescriptionsByPatient = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user;
  const options = searchQuery(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
  const result = await PrescriptionService.getPrescriptionsByPatient(
    decodedToken as IJwtPayload,
    options
  );
  sendResponse(res, {
    success: true,
    message: "Patient's prescriptions retrieved successfully.",
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const PrescriptionController = {
  createPrescription,
  getPrescriptionsByPatient
};
