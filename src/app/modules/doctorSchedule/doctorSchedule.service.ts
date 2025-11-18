import httpStatus from 'http-status';
import { AppError } from "../../helpers/AppError";
import { prisma } from "../../shared/prisma";
import { IJwtPayload } from '../../interfaces/jwtPayload';
import { calculatePagination } from '../../helpers/paginationHelpers';
import { Prisma } from '@prisma/client';

//CREATE DOCTOR SCHEDULE
const doctorScheduleService = async (user: IJwtPayload, payload: {
    scheduleIds: string[]
}) => {

    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user.email
        }
    });

    if (!doctorData) {
        throw new AppError(httpStatus.BAD_REQUEST, "No doctors data found.");
    };

    const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
        doctorId: doctorData.id,
        scheduleId
    }));


    return await prisma.doctorSchedules.createMany({
        data: doctorScheduleData
    });

};

//get DOCTOR SCHEDULE
const doctorScheduleGetAll = async (decodedToken: IJwtPayload) => {

    const doctor = await prisma.doctor.findFirst({
        where: {
            email: decodedToken.email
        }
    });

    if (!doctor) {
        throw new AppError(httpStatus.BAD_REQUEST, "No doctors data found.");
    }

    const doctorSchedule = await prisma.doctorSchedules.findMany({
        where: {
            doctorId: doctor.id
        }
    });

    return doctorSchedule;

};

//GET MY SCHEDULE SERVICE
const getMyScheduleService = async (decodedToken: IJwtPayload, filters: any, options: any) => {

    const { limit, page, skip } = calculatePagination(options);
    const { startDate, endDate, ...filterData } = filters

    const andConditions: Prisma.DoctorSchedulesWhereInput[] = [];
    if (startDate && endDate) {
        andConditions.push({
            AND: [
                {
                    schedule: {
                        startDateTime: {
                            gte: startDate
                        }
                    }
                },
                {
                    schedule: {
                        endDateTime: {
                            lte: endDate
                        }
                    }
                },
            ]
        });
    };

    if (Object.keys(filterData).length > 0) {
        if (typeof filterData.isBooked === 'string' && filterData.isBooked === 'true') {
            filterData.isBooked = true;
        }
        if (typeof filterData.isBooked === 'string' && filterData.isBooked === 'false') {
            filterData.isBooked = false;
        }
        andConditions.push({
            AND: Object.keys(filterData).map(key => {
                return {
                    [key]: {
                        equals: (filterData as any)[key],
                    },
                };
            }),
        })
    };

    const whereConditions: Prisma.DoctorSchedulesWhereInput =
        andConditions.length > 0
            ? {
                AND: andConditions,
            }
            : {};

    const result = await prisma.doctorSchedules.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder ? {
                [options.sortBy]: options.sortOrder,
            } : {
                createdAt: 'desc'
            }
    });

    const total = await prisma.doctorSchedules.count({
        where: whereConditions
    });

    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    };

};

//DELETE DOCTOR SCHEDULE
const deleteDoctorScheduleService = async (id: string) => {

    const doctorSchedule = await prisma.doctorSchedules.deleteMany({
        where: {
            scheduleId: id
        }
    });

    return doctorSchedule;
};

export const DoctorScheduleService = {
    doctorScheduleService,
    doctorScheduleGetAll,
    deleteDoctorScheduleService,
    getMyScheduleService
};
