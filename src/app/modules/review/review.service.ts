import httpStatus from "http-status";
import { IJwtPayload } from "../../interfaces/jwtPayload";
import { prisma } from "../../shared/prisma";
import { AppError } from "../../helpers/AppError";

const createDoctorReviews = async (user: IJwtPayload, payload: any) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
  });

  if (patientData.id !== appointmentData.patientId) {
    throw new AppError(httpStatus.BAD_REQUEST, "This is not your appointment!");
  }

  return await prisma.$transaction(async (trx) => {
    const result = await trx.review.create({
      data: {
        appointmentId: appointmentData.id,
        doctorId: appointmentData.doctorId,
        patientId: appointmentData.patientId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    const avgRating = await trx.review.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        doctorId: appointmentData.doctorId,
      },
    });

    await trx.doctor.update({
      where: {
        id: appointmentData.doctorId,
      },
      data: {
        averageRating: avgRating._avg.rating as number,
      },
    });

    return result;
  });
};

export const ReviewService = {
  createDoctorReviews,
};
