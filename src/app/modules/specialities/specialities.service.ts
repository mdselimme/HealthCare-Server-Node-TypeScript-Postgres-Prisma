import { Request } from "express";
import { prisma } from "../../shared/prisma";
import { Specialties } from "@prisma/client";
import { uploadImage } from "../../helpers/fileUploader";
import { IPaginationOptions } from "../../interfaces/pagination";
import { calculatePagination } from "../../helpers/paginationHelpers";

const inserIntoDB = async (req: Request) => {
  if (req.file) {
    const imageUrl = await uploadImage(req);
    req.body.icon = imageUrl;
  }

  const result = await prisma.specialties.create({
    data: req.body,
  });

  return result;
};

const getAllFromDB = async (options: IPaginationOptions) => {

  const { limit, page, skip } = calculatePagination(options);

  const result = await prisma.specialties.findMany({
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder ? {
        [options.sortBy]: options.sortOrder
      } :
        { createdAt: "desc" }
  });

  const total = await prisma.specialties.count();

  return {
    meta: {
      total,
      page,
      limit
    },
    data: result
  }


};

const deleteFromDB = async (id: string): Promise<Specialties> => {
  const result = await prisma.specialties.delete({
    where: {
      id,
    },
  });
  return result;
};

export const SpecialtiesService = {
  inserIntoDB,
  getAllFromDB,
  deleteFromDB,
};
