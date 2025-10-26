import { IJwtPayload } from "../../interfaces/jwtPayload";
import { prisma } from "../../shared/prisma";

const getPatientData = async (decodedToken: IJwtPayload) => {
  const patient = await prisma.patient.findUnique({
    where: {
      email: decodedToken.email,
      isDeleted: false,
    },
  });

  return patient;
};

export const PatientServices = {
  getPatientData,
};
