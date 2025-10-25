import httpStatus from "http-status";
import { AppError } from "../../helpers/AppError";
import { IJwtPayload } from "../../interfaces/jwtPayload";
import { prisma } from "../../shared/prisma";
import { v4 as uuidv4 } from "uuid";
// CREATE AN APPOINTMENT
const createAnAppointment = async (
  decodedToken: IJwtPayload,
  payload: { doctorId: string; scheduleId: string }
) => {
  console.log({ decodedToken, payload });
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: decodedToken.email,
      isDeleted: false,
    },
  });
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });
  const scheduleData = await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: payload.doctorId,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });
  const videoCallingId = uuidv4();
  const appointCreateData = {
    ...payload,
    patientId: patientData.id,
    videoCallingId,
  };

  const result = await prisma.$transaction(async (trx) => {
    const appointmentData = await trx.appointment.create({
      data: appointCreateData,
    });
    await trx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });
    return appointmentData;
  });

  return result;
};

// UPDATE DOCTOR
const updateDoctor = async () => {};

// GET AI DOCTOR SUGGESTION
const getAISuggestion = async (payload: { symptoms: string }) => {};

export const AppointmentServices = {
  createAnAppointment,
};
