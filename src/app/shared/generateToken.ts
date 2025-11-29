import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";


export const generateToken = (
  payload: JwtPayload,
  secret: Secret,
  expiresIn: string
) => {
  return jwt.sign(payload, secret, {
    expiresIn: `${expiresIn}`,
    algorithm: "HS256",
  } as SignOptions);
};

export const verifyToken = (token: string, secret: Secret) => {
  console.log({ token, secret })
  const verifiedToken = jwt.verify(token, secret);
  return verifiedToken;
};
