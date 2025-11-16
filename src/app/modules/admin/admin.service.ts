import { get } from 'http';
import { calculatePagination, IOptions } from '../../helpers/paginationHelpers';
import { IAdminFilter } from './admin.interface';
import { Prisma } from '@prisma/client';
import { adminSearchAbleFields } from './admin.constant';
import { prisma } from '../../shared/prisma';


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



export const AdminService = {
    getAllAdminData
}