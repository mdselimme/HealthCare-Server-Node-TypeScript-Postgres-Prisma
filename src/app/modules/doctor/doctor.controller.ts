import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { searchQuery } from "../../helpers/searchQuery";
import { DoctorServices } from "./doctor.service";

// DOCTOR GET ALL DB
const getAllDoctorDB = catchAsync(async (req: Request, res: Response) => {
  const options = searchQuery(req.query, [
    "page",
    "limit",
    "sortBy",
    "sortOrder",
  ]);
  const filters = searchQuery(req.query, [
    "email",
    "contactNumber",
    "gender",
    "appointmentFee",
    "specialties",
    "searchTerm",
  ]);

  const result = await DoctorServices.getAllDoctorsFromDb(options, filters);

  sendResponse(res, {
    success: true,
    message: "Doctor Retrieved Successfully",
    data: result,
    statusCode: httpStatus.OK,
  });
});

// DOCTOR GET ALL DB
const updateDoctor = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user;

  const result = await DoctorServices.updateDoctor(
    decodedToken.email,
    req.body
  );

  sendResponse(res, {
    success: true,
    message: "Update doctor Successfully",
    data: result,
    statusCode: httpStatus.OK,
  });
});

//GET AI DOCTOR SUGGESTION
const getAISuggestion = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorServices.getAISuggestion(req.body);

  sendResponse(res, {
    success: true,
    message: "Ai doctors suggestion find Successfully.",
    data: result,
    statusCode: httpStatus.OK,
  });
});

//GET DOCTOR BY ID
const getDoctorById = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorServices.getDoctorById(req.params.id);

  sendResponse(res, {
    success: true,
    message: "Doctor Retrieved Successfully.",
    data: result,
    statusCode: httpStatus.OK,
  });
});

// SOFT DELETE DOCTOR BY ID 
const softDeleteDoctorById = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorServices.softDeleteDoctorById(req.params.id);

  sendResponse(res, {
    success: true,
    message: "Doctor Soft Deleted Successfully.",
    data: result,
    statusCode: httpStatus.OK,
  });
});

// DELETE DOCTOR BY ID
const deleteDoctorById = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorServices.deleteDoctorById(req.params.id);

  sendResponse(res, {
    success: true,
    message: "Doctor Deleted Successfully.",
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const DoctorController = {
  getAllDoctorDB,
  updateDoctor,
  getAISuggestion,
  getDoctorById,
  softDeleteDoctorById,
  deleteDoctorById,
};
