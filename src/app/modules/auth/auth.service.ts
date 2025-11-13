import { UserStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { AppError } from "../../helpers/AppError";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { generateToken, verifyToken } from "../../shared/generateToken";
import { IJwtPayload } from "../../interfaces/jwtPayload";

// Auth login
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

// REFRESH TOKEN
const refreshToken = async (token: string) => {
  const decodedToken = verifyToken(token, config.jwt.refresh_token_secret as Secret) as IJwtPayload;

  const user = await prisma.user.findUnique({
    where: {
      email: decodedToken.email,
      status: UserStatus.ACTIVE
    }
  });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Unauthorized user request.")
  };

  const tokenData: Partial<IJwtPayload> = {
    userId: user.id,
    role: user.role,
    email: user.email
  }

  const accessToken = generateToken(tokenData, config.jwt.access_token_secret as Secret, config.jwt.access_token_expires as string);

  return {
    accessToken
  }

}

// Change Password
const changePassword = async (decodedToken: IJwtPayload, payload: { newPassword: string; oldPassword: string }) => {

  const user = await prisma.user.findUnique({
    where: {
      email: decodedToken.email
    }
  })

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User not authorized.")
  }

  const IsOldPassMatch = await bcrypt.compare(payload.oldPassword, user.password);


  if (!IsOldPassMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, "Old password does not match.")
  };

  const hashPassword = await bcrypt.hash(payload.newPassword, Number(config.bcrypt_salt_round));

  await prisma.user.update({
    where: {
      email: decodedToken.email
    },
    data: {
      password: hashPassword,
      needPasswordChange: false
    }
  })

  return {
    message: "Password Changed Successfully."
  }

}

// forgot Password
const forgotPassword = async (payload: { email: string }) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email
    }
  })

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not found! Give right email.")
  }

  const tokenData: Partial<IJwtPayload> = {
    userId: user.id,
    role: user.role,
    email: user.email
  }

  const forgotPasswordToken = generateToken(tokenData, config.jwt.forgot_password_token_secret as Secret, config.jwt.forgot_password_token_expires as string);




}

// reset Password
const resetPassword = async () => {

}




export const AuthService = {
  authServerLogIn,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
