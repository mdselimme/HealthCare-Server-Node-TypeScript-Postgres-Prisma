import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { AuthService } from "./auth.service";
import { setTokenInCookie } from "../../shared/setTokinCookie";

// AUTH LOGIN
const userLogIn = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.authServerLogIn(req.body);

  setTokenInCookie(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });

  sendResponse(res, {
    success: true,
    message: "User Login Successfully",
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const AuthController = {
  userLogIn,
};
