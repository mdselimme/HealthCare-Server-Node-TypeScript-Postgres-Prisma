import { Prisma } from "@prisma/client";
import { calculatePagination, IOptions } from "../../helpers/paginationHelpers"
import { prisma } from "../../shared/prisma";



// GET ALL DOCTORS FROM DB 
const getAllDoctorsFromDb = async (options: IOptions, filters: any) => {

    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
    const { searchTerm, specialties, ...filterData } = filters;

    const andConditions: Prisma.DoctorWhereInput[] = [];

    const doctorSearchableFields = ["name", "email", "contactNumber"]

    if (searchTerm) {
        andConditions.push({
            OR: doctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    };
    if (Object.keys(filterData).length > 0) {
        const filterCondition = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: (filterData)
            }
        }));
        andConditions.push(...filterCondition)
    }

    const whereConditions: Prisma.DoctorWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {};

    const result = await prisma.doctor.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const total = await prisma.doctor.count({
        where: whereConditions
    });

    return {
        meta: {
            total,
            limit,
            page,
            totalPages: Math.round(total / limit)
        },
        data: result,
    }

}








export const DoctorServices = {
    getAllDoctorsFromDb
}