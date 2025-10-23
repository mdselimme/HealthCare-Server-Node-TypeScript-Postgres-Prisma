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
            id: user.email
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
const doctorScheduleAll = async () => {

};

//DELETE DOCTOR SCHEDULE
const deleteDoctorSchedule = async (id: string) => {




};

export const DoctorScheduleService = {
    doctorScheduleService,
    // doctorScheduleGetAll,
    // deleteDoctorScheduleService
};
