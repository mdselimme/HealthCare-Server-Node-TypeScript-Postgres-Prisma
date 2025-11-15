import httpStatus from 'http-status';
import { UserStatus } from "@prisma/client";
import { IJwtPayload } from "../../interfaces/jwtPayload";
import { prisma } from "../../shared/prisma";
import { AppError } from "../../helpers/AppError";

const getPatientData = async (decodedToken: IJwtPayload) => {
  const patient = await prisma.patient.findUnique({
    where: {
      email: decodedToken.email,
      isDeleted: false,
    },
  });

  return patient;
};


// GET PATIENT BY ID SERVICE
const getPatientById = async (patientId: string) => {

  const patient = await prisma.patient.findUnique({
    where: {
      id: patientId,
      isDeleted: false,
    },
  });

  if (!patient) {
    throw new AppError(httpStatus.NOT_FOUND
      , "Patient not found");
  }

  return patient;
};

// PATIENT SOFT DELETE SERVICE
const softDeletePatient = async (patientId: string) => {

  return await prisma.$transaction(async (trx) => {

    const deletedPatient = await trx.patient.update({
      where: {
        id: patientId,
      },
      data: {
        isDeleted: true,
      },
    });

    await trx.user.updateMany({
      where: {
        email: deletedPatient.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deletedPatient;
  })

};


export const PatientServices = {
  getPatientData,
  softDeletePatient,
  getPatientById
};
