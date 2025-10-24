import httpStatus from "http-status";
import { Doctor, Prisma } from "@prisma/client";
import { calculatePagination, IOptions } from "../../helpers/paginationHelpers";
import { prisma } from "../../shared/prisma";
import { AppError } from "../../helpers/AppError";

// GET ALL DOCTORS FROM DB
const getAllDoctorsFromDb = async (options: IOptions, filters: any) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const { searchTerm, specialties, ...filterData } = filters;

  const andConditions: Prisma.DoctorWhereInput[] = [];

  const doctorSearchableFields = ["name", "email", "contactNumber"];

  if (searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (specialties && specialties.length > 0) {
    andConditions.push({
      doctorSpecialties: {
        some: {
          specialities: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterCondition = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: filterData[key],
      },
    }));
    andConditions.push(...filterCondition);
  }

  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });

  const total = await prisma.doctor.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      limit,
      page,
      totalPages: Math.round(total / limit),
    },
    data: result,
  };
};

// UPDATE DOCTOR
const updateDoctor = async (email: string, payload: Partial<Doctor>) => {
  const doctorInfo = await prisma.doctor.findUnique({
    where: {
      email: email,
    },
  });

  if (!doctorInfo) {
    throw new AppError(httpStatus.BAD_REQUEST, "doctor data does not found.");
  }

  const updatedData = await prisma.doctor.update({
    where: {
      id: doctorInfo.id,
    },
    data: payload,
  });

  return updatedData;
};

export const DoctorServices = {
  getAllDoctorsFromDb,
  updateDoctor,
};
