import httpStatus from 'http-status';
import { Prisma, UserStatus } from "@prisma/client";
import { IJwtPayload } from "../../interfaces/jwtPayload";
import { prisma } from "../../shared/prisma";
import { AppError } from "../../helpers/AppError";
import { calculatePagination, IOptions } from '../../helpers/paginationHelpers';
import { IPatientFilter } from './patient.interface';
import { patientSearchableFields } from './patient.constant';


// GET ALL PATIENT DATA SERVICE
const getAllPatientData = async (filters: IPatientFilter, options: IOptions) => {

  const { limit, page, skip } = calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  };

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        return {
          [key]: {
            equals: (filterData as any)[key],
            mode: 'insensitive'
          }
        }
      })
    });
  };

  andConditions.push({ isDeleted: false });

  const whereCondition: Prisma.PatientWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.patient.findMany({
    where: whereCondition,
    skip: skip,
    take: limit,
    orderBy: options.sortBy && options.sortOrder ? { [options.sortBy]: options.sortOrder }
      :
      { createdAt: 'desc' },
  });

  const total = await prisma.patient.count({
    where: whereCondition,
  });
  return {
    meta: {
      total,
      page,
      limit
    },
    data: result
  };
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
  getAllPatientData,
  softDeletePatient,
  getPatientById
};
