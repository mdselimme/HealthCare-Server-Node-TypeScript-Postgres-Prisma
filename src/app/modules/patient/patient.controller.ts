import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { PatientServices } from "./patient.service";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { IJwtPayload } from "../../interfaces/jwtPayload";
import { searchQuery } from "../../helpers/searchQuery";
import { patientFilterableFields } from "./patient.constant";

// GET PATIENT DATA
const getAllPatientData = catchAsync(async (req: Request, res: Response) => {

  const filters = searchQuery(req.query, patientFilterableFields);
  const options = searchQuery(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await PatientServices.getAllPatientData(
    filters,
    options
  );

  sendResponse(res, {
    success: true,
    message: "User Login Successfully",
    data: result,
    statusCode: httpStatus.OK,
  });
});

// UPDATE PATIENT DATA
const updatePatient = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as IJwtPayload;
  const payload = req.body;
  const result = await PatientServices.updatePatient(decodedToken, payload);
  sendResponse(res, {
    success: true,
    message: "Patient updated successfully",
    data: result,
    statusCode: httpStatus.OK,
  });
});

// GET PATIENT BY ID 
const getPatientById = catchAsync(async (req: Request, res: Response) => {
  const patientId = req.params.id;
  const result = await PatientServices.getPatientById(patientId);
  sendResponse(res, {
    success: true,
    message: "Patient fetched successfully",
    data: result,
    statusCode: httpStatus.OK,
  });
});


// SOFT DELETE PATIENT
const softDeletePatient = catchAsync(async (req: Request, res: Response) => {
  const patientId = req.params.id;

  const result = await PatientServices.softDeletePatient(patientId);
  sendResponse(res, {
    success: true,
    message: "Patient soft deleted successfully",
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const PatientController = {
  getAllPatientData,
  softDeletePatient,
  getPatientById,
  updatePatient
};
