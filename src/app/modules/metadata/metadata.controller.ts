import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../interfaces/jwtPayload";
import httpStatus from "http-status";
import { MetaDataService } from "./metadata.service";

const fetchDashboardMetaData = catchAsync(
  async (req: Request, res: Response) => {
    const decodedToken = req.user;

    const result = await MetaDataService.fetchDashboardMetaData(
      decodedToken as IJwtPayload
    );

    sendResponse(res, {
      success: true,
      message: "Meta data retrieved Successfully",
      data: result,
      statusCode: httpStatus.OK,
    });
  }
);

export const MetaDataController = {
  fetchDashboardMetaData,
};
