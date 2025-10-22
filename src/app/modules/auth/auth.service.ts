import { UserStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { AppError } from "../../helpers/AppError";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { generateToken } from "../../shared/generateToken";

// CREATE PATIENT SERVICE FUNCTION
const authServerLogIn = async (payload: {
  email: string;
  password: string;
}) => {
  const userResult = await prisma.user.findUnique({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!userResult) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid User Email.");
  }
  const passwordCheck = await bcrypt.compare(
    payload.password,
    userResult.password
  );
  if (!passwordCheck) {
    throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password.");
  }

  const userJwtPayload = {
    userId: userResult.id,
    email: userResult.email,
    role: userResult.role,
  };

  const accessToken = generateToken(
    userJwtPayload,
    config.jwt.access_token_secret as Secret,
    config.jwt.access_token_expires as string
  );

  const refreshToken = generateToken(
    userJwtPayload,
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires as string
  );

  const { password: _, ...rest } = userResult;

  return {
    user: rest,
    accessToken,
    refreshToken,
  };
};

export const AuthService = {
  authServerLogIn,
};
