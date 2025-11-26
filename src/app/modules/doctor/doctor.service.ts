import httpStatus from "http-status";
import { Prisma, UserStatus } from "@prisma/client";
import { calculatePagination, IOptions } from "../../helpers/paginationHelpers";
import { prisma } from "../../shared/prisma";
import { AppError } from "../../helpers/AppError";
import { openai } from "../../helpers/askOpenRouter";
import { extractJsonFromMessage } from "../../helpers/extractJsonFromMessage";
import { IDoctorFilterRequest, IDoctorUpdate } from "./doctor.interface";
import { doctorSearchableFields } from "./doctor.constants";
import { IPaginationOptions } from "../../interfaces/pagination";

// GET ALL DOCTORS FROM DB
const getAllDoctorsFromDb = async (options: IOptions, filters: any) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const { searchTerm, specialties, ...filterData } = filters;

  const andConditions: Prisma.DoctorWhereInput[] = [];


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
  payload: Partial<IDoctorUpdate>
) => {
  const doctorInfo = await prisma.doctor.findUnique({
    where: {
      email: email,
      isDeleted: false,
    },
  });

  if (!doctorInfo) {
    throw new AppError(httpStatus.BAD_REQUEST, "doctor data does not found.");
  }

  const { specialties, removeSpecialties, ...doctorData } = payload;

  return await prisma.$transaction(async (trx) => {

    // update doctor basic data 
    if (Object.keys(doctorData).length > 0) {
      await trx.doctor.update({
        where: {
          email: email,
        },
        data: doctorData,
      });
    };

    // remove specialties if provided 
    if (removeSpecialties && Array.isArray(removeSpecialties) && removeSpecialties.length > 0) {

      // validate that specialities to be removed exist for the doctor
      const existingDoctorSpecialties = await trx.doctorSpecialties.findMany({
        where: {
          doctorId: doctorInfo.id,
          specialitiesId: {
            in: removeSpecialties
          },
        },
      });

      if (existingDoctorSpecialties.length !== removeSpecialties.length) {
        const foundIds = existingDoctorSpecialties.map(ds => ds.specialitiesId);
        const notFoundIds = removeSpecialties.filter(id => !foundIds.includes(id));
        throw new AppError(httpStatus.BAD_REQUEST, `Specialties to be removed not found for the doctor: ${notFoundIds.join(", ")}`);
      }

      // Delete the specialties 
      await trx.doctorSpecialties.deleteMany({
        where: {
          doctorId: doctorInfo.id,
          specialitiesId: {
            in: removeSpecialties
          },
        },
      });
    };

    // Add new specialties if provided 
    if (specialties && Array.isArray(specialties) && specialties.length > 0) {
      // Verify all specialties exist in Specialties table
      const existingSpecialties = await trx.specialties.findMany({
        where: {
          id: {
            in: specialties,
          },
        },
        select: {
          id: true,
        },
      });

      const existingSpecialtyIds = existingSpecialties.map((s) => s.id);
      const invalidSpecialties = specialties.filter(
        (id) => !existingSpecialtyIds.includes(id)
      );

      if (invalidSpecialties.length > 0) {
        throw new Error(
          `Invalid specialty IDs: ${invalidSpecialties.join(", ")}`
        );
      }
      // Check for duplicates - don't add specialties that already exist
      const currentDoctorSpecialties =
        await trx.doctorSpecialties.findMany({
          where: {
            doctorId: doctorInfo.id,
            specialitiesId: {
              in: specialties,
            },
          },
          select: {
            specialitiesId: true,
          },
        });

      const currentSpecialtyIds = currentDoctorSpecialties.map(
        (ds) => ds.specialitiesId
      );
      const newSpecialties = specialties.filter(
        (id) => !currentSpecialtyIds.includes(id)
      );

      // Only create new specialties that don't already exist
      if (newSpecialties.length > 0) {
        const doctorSpecialtiesData = newSpecialties.map((specialtyId) => ({
          doctorId: doctorInfo.id,
          specialitiesId: specialtyId,
        }));

        await trx.doctorSpecialties.createMany({
          data: doctorSpecialtiesData,
        });
      }
    }

    // return update doctor with specialties 
    const result = await prisma.doctor.findUnique({
      where: {
        id: doctorInfo.id,
      },
      include: {
        doctorSpecialties: {
          include: {
            specialities: true,
          },
        },
      },
    });

    return result;
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
  const prompt = `You are a medical assistant AI. Based on the patient's symptoms, suggest the top 3 most suitable doctors. Each doctor has specialties and years of experience. Only suggest doctors who are relevant to the given symptoms. Symptoms: ${payload.symptoms
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

// SOFT DELETE DOCTOR BY ID
const softDeleteDoctorById = async (id: string) => {

  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
    },
  });

  if (!doctor) {
    throw new AppError(httpStatus.BAD_REQUEST, "doctor data does not found.");
  }

  return await prisma.$transaction(async (trx) => {

    const softDeletedDoctor = await trx.doctor.update({
      where: { id, },
      data: { isDeleted: true, },
    });

    await trx.user.update({
      where: { email: doctor.email, },
      data: { status: UserStatus.DELETED, },
    });

    return softDeletedDoctor;
  });

};

// DELETE DOCTOR BY ID
const deleteDoctorById = async (id: string) => {

  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
    },
  });

  if (!doctor) {
    throw new AppError(httpStatus.BAD_REQUEST, "doctor data does not found.");
  };

  const deletedDoctor = await prisma.$transaction(async (trx) => {

    await trx.doctor.delete({
      where: { id, },
    });

    await trx.user.delete({
      where: { email: doctor.email, },
    });

    return doctor;
  });

  return deletedDoctor;
};


// GET ALL PUBLIC DOCTORS 
const getAllPublicDoctor = async (
  filters: IDoctorFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = calculatePagination(options);
  const { searchTerm, specialties, ...filterData } = filters;

  const andConditions: Prisma.DoctorWhereInput[] = [];

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

  // Handle multiple specialties: ?specialties=Cardiology&specialties=Neurology
  if (specialties && specialties.length > 0) {
    // Convert to array if single string
    const specialtiesArray = Array.isArray(specialties) ? specialties : [specialties];

    andConditions.push({
      doctorSpecialties: {
        some: {
          specialities: {
            title: {
              in: specialtiesArray,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { averageRating: "desc" },
    select: {
      id: true,
      name: true,
      // email: false, // Hide email in public API
      profilePhoto: true,
      contactNumber: true,
      address: true,
      registrationNumber: true,
      experience: true,
      gender: true,
      appointmentFee: true,
      qualification: true,
      currentWorkingPlace: true,
      designation: true,
      averageRating: true,
      createdAt: true,
      updatedAt: true,
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
      reviews: {
        select: {
          rating: true,
          comment: true,
          createdAt: true,
          patient: {
            select: {
              name: true,
              profilePhoto: true,
            },
          },
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
      page,
      limit,
    },
    data: result,
  };
};

export const DoctorServices = {
  getAllDoctorsFromDb,
  updateDoctor,
  getAISuggestion,
  getDoctorById,
  softDeleteDoctorById,
  deleteDoctorById,
  getAllPublicDoctor
};
