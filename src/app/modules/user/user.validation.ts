import z from "zod";

export const createUserValidationZodSchema = z.object({
  password: z
    .string({
      error: "Password must be string.",
    })
    .min(8, { error: "Password minimum 8 characters long." }),
  patient: z.object({
    name: z
      .string({
        error: "Name must be string.",
      })
      .min(3, { error: "Password minimum 3 characters long." }),
    email: z.email({
      error: "email must be string & valid email format.",
    }),
    address: z
      .string({
        error: "address must be string",
      })
      .optional(),
  }),
});
