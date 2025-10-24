import { z } from "zod";

export const createSpecialityZodSchema = z.object({
    title: z.string({
        error: "Title is required!"
    })
});