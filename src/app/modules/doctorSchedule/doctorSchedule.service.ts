import httpStatus from 'http-status';
import { AppError } from "../../helpers/AppError";
import { prisma } from "../../shared/prisma";
import { IJwtPayload } from '../../interfaces/jwtPayload';

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
    deleteDoctorScheduleService
};
