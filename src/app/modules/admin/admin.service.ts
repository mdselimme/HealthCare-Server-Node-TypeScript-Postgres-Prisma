import httpStatus from 'http-status';
import { calculatePagination, IOptions } from '../../helpers/paginationHelpers';
import { IAdminFilter } from './admin.interface';
import { Prisma, UserStatus } from '@prisma/client';
import { adminSearchAbleFields } from './admin.constant';
import { prisma } from '../../shared/prisma';
import { AppError } from '../../helpers/AppError';


// GET ALL ADMIN DATA 
const getAllAdminData = async (filters: IAdminFilter, options: IOptions) => {
    const { page, limit, skip } = calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions: Prisma.AdminWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: adminSearchAbleFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive'
                }
            }))
        });
    };

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    };

    andConditions.push({
        isDeleted: false
    });

    const whereConditions: Prisma.AdminWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.admin.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder ? {
            [options.sortBy]: options.sortOrder
        } : {
            createdAt: 'desc'
        }
    });

    const total = await prisma.admin.count({
        where: whereConditions
    });

    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    }
};

// GET ADMIN DATA BY ID
const getAdminById = async (id: string) => {
    const admin = await prisma.admin.findUnique({
        where: {
            id,
            isDeleted: false
        }
    });

    if (!admin) {
        throw new AppError(httpStatus.NOT_FOUND, 'Admin data not found');
    }

    return admin;
};

// SOFT DELETE ADMIN DATA BY ID 
const softDeleteAdminById = async (id: string) => {

    const admin = await prisma.admin.findUnique({
        where: {
            id,
            isDeleted: false
        }
    });

    if (!admin) {
        throw new AppError(httpStatus.NOT_FOUND, 'Admin data not found');
    }

    const result = await prisma.$transaction(async (trx) => {

        const adminDataDeleted = await trx.admin.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            }
        });

        await trx.user.update({
            where: {
                email: adminDataDeleted.email
            },
            data: {
                status: UserStatus.DELETED
            }
        });

        return adminDataDeleted;
    });

    return result;
};

export const AdminService = {
    getAllAdminData,
    getAdminById,
    softDeleteAdminById
}