import z from "zod";



export const createDoctorScheduleZodSchema = z.object({
    scheduleIds: z.array(z.string("scheduleIds will be array of schedule ids."), { error: "scheduleIds is an string array." })
});