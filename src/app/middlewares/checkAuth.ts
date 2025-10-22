import { NextFunction, Request, Response } from "express";
import { AppError } from "../helpers/AppError";
import httpStatus from "http-status";
import { verifyToken } from "../shared/generateToken";
import config from "../../config";
import { Secret } from "jsonwebtoken";

const checkAuth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        throw new AppError(httpStatus.BAD_REQUEST, "Token not found.");
      }
      const verifyUser = verifyToken(
        token,
        config.jwt.access_token_secret as Secret
      );
      if (!verifyUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "You are not authorized.");
      }
      if (roles.length && !roles.includes(verifyUser?.role)) {
        throw new AppError(httpStatus.BAD_REQUEST, "You are not authorized.");
      }
      req.user = verifyUser;
      next();
    } catch (error) {
      next(error);
    }
  };

export default checkAuth;
