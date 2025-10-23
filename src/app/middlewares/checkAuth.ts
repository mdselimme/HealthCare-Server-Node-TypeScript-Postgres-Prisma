import { NextFunction, Request, Response } from "express";
import { AppError } from "../helpers/AppError";
import httpStatus from "http-status";
import { verifyToken } from "../shared/generateToken";
import config from "../../config";
import { JwtPayload } from "jsonwebtoken";

const checkAuth =
  (...roles: string[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const token = req.cookies.accessToken;
        if (!token) {
          throw new AppError(httpStatus.BAD_REQUEST, "Token not found.");
        }
        const verifiedUser = verifyToken(
          token,
          config.jwt.access_token_secret as string
        ) as JwtPayload;
        if (!verifiedUser) {
          throw new AppError(httpStatus.BAD_REQUEST, "You are not authorized.");
        }
        if (roles.length && !roles.includes(verifiedUser?.role)) {
          throw new AppError(httpStatus.BAD_REQUEST, "You are not authorized.");
        }
        req.user = verifiedUser;
        next();
      } catch (error) {
        next(error);
      }
    };

export default checkAuth;
