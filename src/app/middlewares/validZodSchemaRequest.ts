import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validZodSchemaRequest =
  (validSchema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await validSchema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
