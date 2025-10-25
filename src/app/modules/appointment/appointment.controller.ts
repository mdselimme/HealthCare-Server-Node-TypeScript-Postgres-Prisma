import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AppointmentServices } from "./appointment.service";
import { IJwtPayload } from "../../interfaces/jwtPayload";

// DOCTOR GET ALL DB
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

export const AppointmentController = {
  createAnAppointment,
};
