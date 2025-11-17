import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AppointmentServices } from "./appointment.service";
import { IJwtPayload } from "../../interfaces/jwtPayload";
import { searchQuery } from "../../helpers/searchQuery";
import { appointSearchQueryFields } from "./appointment.constant";

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

//GET ALL APPOINTMENT
const getAllAppointment = catchAsync(async (req: Request, res: Response) => {

  const options = searchQuery(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const filters = searchQuery(req.query, appointSearchQueryFields);

  const result = await AppointmentServices.getAllAppointment(
    filters,
    options
  );


  sendResponse(res, {
    success: true,
    message: "Appointments Retrieved Successfully",
    data: result,
    statusCode: httpStatus.OK,
  });
})

// GET MY APPOINTMENT
const getMyAppointment = catchAsync(async (req: Request, res: Response) => {
  const options = searchQuery(req.query, [
    "page",
    "limit",
    "sortBy",
    "sortOrder",
  ]);
  const filters = searchQuery(req.query, appointSearchQueryFields);
  const decodedToken = req.user;

  const result = await AppointmentServices.getMyAppointment(
    decodedToken as IJwtPayload,
    filters,
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
const updateAppointmentStatus = catchAsync(
  async (req: Request, res: Response) => {
    const decodedToken = req.user;
    const { id } = req.params;
    const { status } = req.body;

    const result = await AppointmentServices.updateAppointmentStatus(
      id,
      status,
      decodedToken as IJwtPayload
    );
    sendResponse(res, {
      success: true,
      message: "Appointment Booked Successfully",
      data: result,
      statusCode: httpStatus.OK,
    });
  }
);

export const AppointmentController = {
  createAnAppointment,
  getMyAppointment,
  updateAppointmentStatus,
  getAllAppointment
};
