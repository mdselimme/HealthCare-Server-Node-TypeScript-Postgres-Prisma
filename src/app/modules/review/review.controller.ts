import { Request, Response } from "express";
import httpStatus from "http-status";
import { ReviewService } from "./review.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../interfaces/jwtPayload";

const createDoctorReviews = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user;
  const result = await ReviewService.createDoctorReviews(
    decodedToken as IJwtPayload,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

export const ReviewController = {
  createDoctorReviews,
};
