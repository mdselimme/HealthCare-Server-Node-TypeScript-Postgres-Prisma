import z from "zod";

//CREATE USER WITH PATIENT ZOD SCHEMA
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

//CREATE DOCTOR ZOD SCHEMA
export const createDoctorValidationZodSchema = z.object({
  password: z
    .string({
      error: "Password must be string.",
    })
    .min(8, { error: "Password minimum 8 characters long." }),
  doctor: z.object({
    name: z.string({ error: "type is string." }).min(3, { error: "min 3 characters need." }),
    email: z.email({
      error: "email must be string & valid email format.",
    }),
    contactNumber: z
      .string()
      .length(11, { message: "Phone number must be exactly 11 digits" })
      .regex(/^01\d{9}$/, {
        message:
          "Invalid Bangladeshi phone number. It must start with '01' and be exactly 11 digits long.",
      }),
    address: z.string({ error: "address type is string." }),
    registrationNumber: z.string({ error: "registrationNumber type is string." }),
    experience: z.number({ error: "experience type is number." }),
    gender: z.enum(["MALE", "FEMALE"], { error: "Value must be MALE OR FEMALE." }),
    appointmentFee: z.number({ error: "appointmentFee type is number." }).min(0, { error: "value must be greater than 0." }),
    qualification: z.string({ error: "qualification type is string." }),
    currentWorkingPlace: z.string({ error: "current Working Place type is string." }),
    designation: z.string({ error: "designation type is string." }),
  })
});

// CREATE ADMIN ZOD SCHEMA 
export const createAdminZodSchema = z.object({
  password: z
    .string({
      error: "Password must be string.",
    })
    .min(8, { error: "Password minimum 8 characters long." }),
  admin: z.object({
    name: z.string({ error: "type is string." }).min(3, { error: "min 3 characters need." }),
    email: z.email({
      error: "email must be string & valid email format.",
    }),
    contactNumber: z
      .string()
      .length(11, { message: "Phone number must be exactly 11 digits" })
      .regex(/^01\d{9}$/, {
        message:
          "Invalid Bangladeshi phone number. It must start with '01' and be exactly 11 digits long.",
      }),
    address: z.string({ error: "address type is string." }),
  })
});