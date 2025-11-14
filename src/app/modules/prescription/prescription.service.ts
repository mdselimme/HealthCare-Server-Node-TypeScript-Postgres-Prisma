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
import { calculatePagination, IOptions } from "../../helpers/paginationHelpers";


// CREATE PRESCRIPTION SERVICE
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

// GET PRESCRIPTIONS BY PATIENT
const getPrescriptionsByPatient = async (decodedToken: IJwtPayload, options: IOptions) => {

  const { limit, skip, page, sortBy, sortOrder } = calculatePagination(options);

  if (decodedToken.role !== UserRole.PATIENT) {
    throw new AppError(httpStatus.FORBIDDEN, "User is not authorized.");
  }

  const result = await prisma.prescription.findMany({
    where: {
      patient: {
        email: decodedToken.email,
      },
    },
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    }
  });

  if (!result.length) {
    throw new AppError(httpStatus.NOT_FOUND, "No prescriptions found for you.");
  }

  const total = await prisma.prescription.count({
    where: {
      patient: {
        email: decodedToken.email
      }
    }
  })
  return {
    meta: {
      total,
      page,
      limit
    },
    data: result
  };
}

export const PrescriptionService = {
  createPrescription,
  getPrescriptionsByPatient
};
