import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import config from "../../config";

export const generateToken = (
  payload: JwtPayload,
  secret: Secret,
  expiresIn: string
) => {
  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: "HS256",
  } as SignOptions);
};

export const verifyToken = (token: string, secret: Secret) => {
  const verifiedToken = jwt.verify(token, secret);
  return verifiedToken;
};
