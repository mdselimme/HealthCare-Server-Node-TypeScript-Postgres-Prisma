import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AppointmentServices } from "./appointment.service";
import { IJwtPayload } from "../../interfaces/jwtPayload";
import { searchQuery } from "../../helpers/searchQuery";

// CREATE AN APPOINTMENT
const createAnAppointment = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user;

  const result = await AppointmentServices.createAnAppointment(
    decodedToken as IJwtPayload,
    req.body
  );
  sendResponse(res, {
    success: true,
    message: "Appointment Booked Successfully",
    data: result,
    statusCode: httpStatus.OK,
  });
});

// GET ALL APPOINTMENT
const getMyAppointment = catchAsync(async (req: Request, res: Response) => {
  const options = searchQuery(req.query, [
    "page",
    "limit",
    "sortBy",
    "sortOrder",
  ]);
  const fillters = searchQuery(req.query, ["status", "paymentStatus"]);
  const decodedToken = req.user;

  const result = await AppointmentServices.getMyAppointment(
    decodedToken as IJwtPayload,
    fillters,
    options
  );
  sendResponse(res, {
    success: true,
    message: "Appointment Retrieved Successfully",
    data: result,
    statusCode: httpStatus.OK,
  });
});

// UPDATE APPOINTMENT STATUS

export const AppointmentController = {
  createAnAppointment,
  getMyAppointment,
};
