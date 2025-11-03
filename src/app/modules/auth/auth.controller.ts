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

// AUTH Logout
const userLogOut = catchAsync(async (req: Request, res: Response) => {

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  })
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  })

  sendResponse(res, {
    success: true,
    message: "User LogOut Successfully",
    data: null,
    statusCode: httpStatus.OK,
  });
});

export const AuthController = {
  userLogIn,
  userLogOut
};
