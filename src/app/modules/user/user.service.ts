import { Request } from "express";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { AppError } from "../../helpers/AppError";
import httpStatus from "http-status";
import { calculatePagination } from "../../helpers/paginationHelpers";
import { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import { userSearchableFields } from "./user.constant";
import { uploadImage } from "../../helpers/fileUploader";
import { IJwtPayload } from "../../interfaces/jwtPayload";



//HASH PASSWORD FUNCTION
const hashPasswordFunc = async (password: string) => {
  const hashPass = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_round)
  );
  return hashPass;
};

// CREATE PATIENT SERVICE FUNCTION
const createPatientService = async (req: Request) => {
  if (req.file) {
    const imageUrl = await uploadImage(req);
    req.body.patient.profilePhoto = imageUrl;
  }

  const hashPassword = await hashPasswordFunc(req.body.password);

  const user = await prisma.user.findUnique({
    where: {
      email: req.body.patient.email,
    },
  });

  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email Already Exist.");
  }

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.patient.email,
        password: hashPassword,
      },
    });
    return await tnx.patient.create({
      data: req.body.patient,
    });
  });
  return result;
};

// CREATE DOCTOR SERVICE FUNCTION
const createUserAndDoctorService = async (req: Request) => {

  if (req.file) {
    const imageUrl = await uploadImage(req);
    req.body.doctor.profilePhoto = imageUrl;
  }

  const hashPassword = await hashPasswordFunc(req.body.password);

  const user = await prisma.user.findUnique({
    where: {
      email: req.body.doctor.email,
    },
  });

  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email Already Exist.");
  }

  const { specialties, ...doctorData } = req.body.doctor;


  const result = await prisma.$transaction(async (tnx) => {

    // create user 
    await tnx.user.create({
      data: {
        email: req.body.doctor.email,
        password: hashPassword,
        role: UserRole.DOCTOR
      },
    });
    // create doctor 
    const createDoctorData = await tnx.doctor.create({
      data: doctorData,
    });

    if (specialties && Array.isArray(specialties) && specialties.length > 0) {
      const existingSpecialties = await tnx.specialties.findMany({
        where: {
          id: {
            in: specialties
          }
        },
        select: {
          id: true
        }
      });
      const existingSpecialityIds = existingSpecialties.map(spec => spec.id);

      const invalidSpecialities = specialties.filter((id) => !existingSpecialityIds.includes(id));

      if (invalidSpecialities.length > 0) {
        throw new AppError(httpStatus.BAD_REQUEST, `Invalid Speciality IDs: ${invalidSpecialities.join(", ")}`
        );
      }
      // create doctor specialties relations 
      const doctorSpecialtyData = specialties.map((specialtyId: string) => ({
        doctorId: createDoctorData.id,
        specialitiesId: specialtyId
      }));

      await tnx.doctorSpecialties.createMany({
        data: doctorSpecialtyData
      });
    }

    // return doctor with specialties 
    const doctorWithSpecialities = await tnx.doctor.findUnique({
      where: {
        id: createDoctorData.id
      },
      include: {
        doctorSpecialties: {
          include: {
            specialities: true
          }
        }
      }
    });
    return doctorWithSpecialities;
  });
  return result;
};

// CREATE ADMIN SERVICE FUNCTION
const createUserAndAdminService = async (req: Request) => {

  if (req.file) {
    const imageUrl = await uploadImage(req);
    req.body.admin.profilePhoto = imageUrl;
  }

  const hashPassword = await hashPasswordFunc(req.body.password);

  const user = await prisma.user.findUnique({
    where: {
      email: req.body.admin.email,
    },
  });

  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email Already Exist.");
  }

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.admin.email,
        password: hashPassword,
        role: UserRole.ADMIN
      },
    });
    return await tnx.admin.create({
      data: req.body.admin,
    });
  });
  return result;
};

//GET ALL USERS
const getAllUserDb = async (params: any, options: any) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0
      ? {
        AND: andConditions,
      }
      : {};

  const result = await prisma.user.findMany({
    skip,
    take: limit,
    where: {
      AND: andConditions,
    },
    omit: {
      password: true,
    },
    orderBy:
      sortBy && sortOrder
        ? {
          [sortBy]: sortOrder,
        }
        : {
          createdAt: "desc",
        },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    result,
  };
};

//GET ME USER
const getMeUserFromDb = async (decodedToken: IJwtPayload) => {

  const userInfo = await prisma.user.findUnique({
    where: {
      id: decodedToken.userId,
      status: UserStatus.ACTIVE
    },
    omit: {
      password: true,
    }
  });

  if (!userInfo) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not found.");
  }

  let profileInfo;

  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        contactNumber: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        contactNumber: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
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
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        doctorSpecialties: {
          include: {
            specialities: true,
          },
        },
      },
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        contactNumber: true,
        address: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        patientHealthData: true,
        medicalReports: {
          select: {
            id: true,
            patientId: true,
            reportName: true,
            reportLink: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  return { ...userInfo, ...profileInfo };

};

// UPDATE USER STATUS SERVICE 
const updateUserStatusService = async (id: string, payload: { status: UserStatus }) => {

  const user = await prisma.user.findUnique({
    where: { id }
  })

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not found.");
  }

  const updateUserStatusResult = await prisma.user.update({
    where: {
      id
    },
    data: {
      status: payload.status
    }
  });

  return updateUserStatusResult;
};

// UPDATE MY PROFILE SERVICE 
const updateMyProfileService = async (decodedToken: IJwtPayload, req: Request) => {


  const user = await prisma.user.findUnique({
    where: {
      id: decodedToken.userId,
      status: UserStatus.ACTIVE
    }
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not found.");
  };

  if (req.file) {
    const imageUrl = await uploadImage(req);
    req.body.profilePhoto = imageUrl;
  };

  let profileInfo: Partial<User> = {};

  if (user.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: user.email
      },
      data: req.body
    })
  }
  else if (user.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.update({
      where: {
        email: user.email
      },
      data: req.body
    })
  }
  else if (user.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.update({
      where: {
        email: user.email
      },
      data: req.body
    })
  }

  const { password: _, ...restUserData } = profileInfo;

  return { ...restUserData };

};

export const UserService = {
  createUserAndDoctorService,
  createPatientService,
  getAllUserDb,
  createUserAndAdminService,
  getMeUserFromDb,
  updateUserStatusService,
  updateMyProfileService
};
