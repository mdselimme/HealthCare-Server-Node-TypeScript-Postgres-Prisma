import { IJwtPayload } from './../../interfaces/jwtPayload';
import { addMinutes, format, addHours } from "date-fns";
import { prisma } from "../../shared/prisma";
import { calculatePagination, IOptions } from "../../helpers/paginationHelpers";
import { Prisma } from "@prisma/client";
//CREATE DOCTOR SCHEDULE
const scheduleCreateService = async (payload: any) => {
    const { startTime, endTime, startDate, endDate } = payload;

    const intervalTime = 30;

    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    const schedule = []

    while (currentDate <= lastDate) {
        const startDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(startTime.split(":")[0])
                ),
                Number(startTime.split(":")[1])
            )
        );
        const endDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(endTime.split(":")[0])
                ),
                Number(endTime.split(":")[1])
            )
        );

        while (startDateTime < endDateTime) {
            const slotStartDateTime = startDateTime;
            const slotEndDateTime = addMinutes(startDateTime, intervalTime);
            const scheduleData = {
                startDateTime: slotStartDateTime,
                endDateTime: slotEndDateTime
            }

            const existingSchedule = await prisma.schedule.findFirst({
                where: scheduleData
            });

            if (!existingSchedule) {
                const result = await prisma.schedule.create({
                    data: scheduleData
                })
                schedule.push(result)
            }

            slotStartDateTime.setMinutes(slotStartDateTime.getMinutes() + intervalTime)

        }
        currentDate.setDate(currentDate.getDate() + 1)

    };

    return schedule;
};

//get DOCTOR SCHEDULE
const doctorScheduleAll = async (decodedToken: IJwtPayload, options: IOptions, params: any) => {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
    const { startDateTime: filterStartDateTime, endDateTime: filterEndDateTime } = params;

    const andConditions: Prisma.ScheduleWhereInput[] = [];

    if (filterStartDateTime && filterEndDateTime) {
        andConditions.push({
            AND: [
                {
                    startDateTime: {
                        gte: filterStartDateTime
                    }
                },
                {
                    endDateTime: {
                        lte: filterEndDateTime
                    }
                }
            ]
        })
    };

    const whereConditions: Prisma.ScheduleWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {};

    const doctorSchedule = await prisma.doctorSchedules.findMany({
        where: {
            doctor: {
                email: decodedToken.email
            }
        },
        select: {
            scheduleId: true
        }
    });

    const doctorScheduleIds = doctorSchedule.map((schedule) => schedule.scheduleId);

    const result = await prisma.schedule.findMany({
        where: {
            ...whereConditions,
            id: {
                notIn: doctorScheduleIds
            }
        },
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const total = await prisma.schedule.count({
        where: {
            ...whereConditions,
            id: {
                notIn: doctorScheduleIds
            }
        },
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
};

//DELETE DOCTOR SCHEDULE
const deleteDoctorSchedule = async (id: string) => {


    return await prisma.schedule.delete({
        where: {
            id
        }
    })


};

export const ScheduleService = {
    scheduleCreateService,
    doctorScheduleAll,
    deleteDoctorSchedule
};
