import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { PrescriptionService } from "./prescription.service";
import { IJwtPayload } from "../../interfaces/jwtPayload";

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

export const PrescriptionController = {
  createPrescription,
};
