import { Response } from "express";

interface IToken {
  accessToken: string;
  refreshToken: string;
}

export const setTokenInCookie = (res: Response, token: IToken) => {
  if (token.accessToken) {
    res.cookie("accessToken", token.accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 1,
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });
  }
  if (token.refreshToken) {
    res.cookie("refreshToken", token.refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });
  }
};
