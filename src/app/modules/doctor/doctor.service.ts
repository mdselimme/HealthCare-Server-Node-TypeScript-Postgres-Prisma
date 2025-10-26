import httpStatus from "http-status";
import { Doctor, Prisma } from "@prisma/client";
import { calculatePagination, IOptions } from "../../helpers/paginationHelpers";
import { prisma } from "../../shared/prisma";
import { AppError } from "../../helpers/AppError";
import { IDoctorUpdateInput } from "./doctor.interface";
import { openai } from "../../helpers/askOpenRouter";
import { extractJsonFromMessage } from "../../helpers/extractJsonFromMessage";

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
      reviews: true,
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
const updateDoctor = async (
  email: string,
  payload: Partial<IDoctorUpdateInput>
) => {
  const doctorInfo = await prisma.doctor.findUnique({
    where: {
      email: email,
    },
  });

  if (!doctorInfo) {
    throw new AppError(httpStatus.BAD_REQUEST, "doctor data does not found.");
  }

  const { specialties, ...doctorData } = payload;

  return await prisma.$transaction(async (trx) => {
    if (specialties && specialties.length > 0) {
      const deleteSpecialtyId = specialties.filter(
        (specialty: any) => specialty.isDeleted
      );

      for (const specialty of deleteSpecialtyId) {
        await trx.doctorSpecialties.deleteMany({
          where: {
            doctorId: doctorInfo.id,
            specialitiesId: specialty.specialtyId,
          },
        });
      }

      const createSpecialtyId = specialties.filter(
        (specialty: any) => !specialty.isDeleted
      );

      for (const specialty of createSpecialtyId) {
        await trx.doctorSpecialties.create({
          data: {
            doctorId: doctorInfo.id,
            specialitiesId: specialty.specialtyId,
          },
        });
      }
    }

    return await trx.doctor.update({
      where: {
        id: doctorInfo.id,
      },
      data: doctorData,
      include: {
        doctorSpecialties: {
          include: {
            specialities: true,
          },
        },
      },
    });
  });
};

// GET AI DOCTOR SUGGESTION
const getAISuggestion = async (payload: { symptoms: string }) => {
  console.log(payload);
  if (!(payload && payload.symptoms)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Symptom is required.");
  }
  const doctors = await prisma.doctor.findMany({
    where: { isDeleted: false },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });

  console.log("doctors data loaded.......\n");
  const prompt = `You are a medical assistant AI. Based on the patient's symptoms, suggest the top 3 most suitable doctors. Each doctor has specialties and years of experience. Only suggest doctors who are relevant to the given symptoms. Symptoms: ${
    payload.symptoms
  }. Here is the doctor list (in JSON):
    ${JSON.stringify(
      doctors,
      null,
      2
    )} Return your response in JSON format with full individual doctor data.`;

  console.log("analyzing......\n");
  const completion = await openai.chat.completions.create({
    model: "z-ai/glm-4.5-air:free",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI medical assistant that provides doctor suggestions.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  const result = await extractJsonFromMessage(completion.choices[0].message);
  return result;
};

// GET DOCTOR BY ID
const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
      doctorSchedules: {
        include: {
          schedule: true,
        },
      },
      reviews: true,
    },
  });

  if (!doctor) {
    throw new AppError(httpStatus.BAD_REQUEST, "doctor data does not found.");
  }

  return doctor;
};

export const DoctorServices = {
  getAllDoctorsFromDb,
  updateDoctor,
  getAISuggestion,
  getDoctorById,
};
