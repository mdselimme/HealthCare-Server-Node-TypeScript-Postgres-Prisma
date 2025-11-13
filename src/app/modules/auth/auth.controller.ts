import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { AuthService } from "./auth.service";
import { setTokenInCookie } from "../../shared/setTokinCookie";
import { IJwtPayload } from "../../interfaces/jwtPayload";
import { AppError } from "../../helpers/AppError";

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

// REFRESH TOKEN
const refreshToken = catchAsync(async (req: Request, res: Response) => {

  const token = req.cookies.refreshToken;

  const result = await AuthService.refreshToken(token);

  sendResponse(res, {
    success: true,
    message: "Refresh token retrieved Successfully",
    data: result,
    statusCode: httpStatus.OK,
  });
});

// Change Password
const changePassword = catchAsync(async (req: Request, res: Response) => {

  const decodedToken = req.user;

  const result = await AuthService.changePassword(decodedToken as IJwtPayload, req.body)

  sendResponse(res, {
    success: true,
    message: "Change Password Successfully",
    data: result,
    statusCode: httpStatus.OK,
  });
});

// forgot Password
const forgotPassword = catchAsync(async (req: Request, res: Response) => {

  const result = await AuthService.forgotPassword(req.body);

  sendResponse(res, {
    success: true,
    message: "Forgot token find Successfully",
    data: null,
    statusCode: httpStatus.OK,
  });
});

// forgot Password
const resetPassword = catchAsync(async (req: Request, res: Response) => {

  const token = req.headers.authorization;

  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, "Reset password token does not found.")
  }

  const result = await AuthService.resetPassword(token, req.body)

  sendResponse(res, {
    success: true,
    message: "Reset Password Successfully",
    data: null,
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
  userLogOut,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
