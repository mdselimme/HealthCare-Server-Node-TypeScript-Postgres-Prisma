import {
  AppointmentStatus,
  PaymentStatus,
  Prescription,
  UserRole,
} from "@prisma/client";
import { IJwtPayload } from "../../interfaces/jwtPayload";
import { prisma } from "../../shared/prisma";
import { AppError } from "../../helpers/AppError";
import httpStatus from "http-status";

const createPrescription = async (
  decodedToken: IJwtPayload,
  payload: Partial<Prescription>
) => {
  const appointData = await prisma.appointment.findUnique({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      doctor: true,
    },
  });

  if (!appointData) {
    throw new AppError(httpStatus.BAD_REQUEST, "No appointment found with id.");
  }

  if (decodedToken.role === UserRole.DOCTOR) {
    if (!(decodedToken.email === appointData.doctor.email)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This is not your appointment."
      );
    }
  }

  const result = await prisma.prescription.create({
    data: {
      appointmentId: appointData.id,
      doctorId: appointData.doctorId,
      patientId: appointData.patientId,
      instructions: payload.instructions as string,
      followUpdate: payload.followUpdate || null,
    },
    include: {
      patient: true,
    },
  });

  return result;
};

export const PrescriptionService = {
  createPrescription,
};
