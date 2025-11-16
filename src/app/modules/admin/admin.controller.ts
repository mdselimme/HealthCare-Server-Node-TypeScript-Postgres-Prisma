import { get } from 'http';
import httpStatus from 'http-status';
import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { AdminService } from './admin.service';
import { searchQuery } from '../../helpers/searchQuery';
import { adminFilterableFields } from './admin.constant';
import { de } from 'zod/v4/locales';

// GET ALL ADMIN DATA 
const getAllAdminData = catchAsync(async (req: Request, res: Response) => {

    const filters = searchQuery(req.query, adminFilterableFields);
    const options = searchQuery(req.query, ['sortBy', 'limit', 'page', 'sortOrder']);

    const result = await AdminService.getAllAdminData(filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin data fetched successfully",
        data: result
    })
});

// GET ADMIN DATA BY ID
const getAdminById = catchAsync(async (req: Request, res: Response) => {

    const result = await AdminService.getAdminById(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin data fetched successfully",
        data: result
    })
});

// SOFT DELETE ADMIN DATA BY ID
const softDeleteAdminById = catchAsync(async (req: Request, res: Response) => {

    const result = await AdminService.softDeleteAdminById(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin data soft deleted successfully",
        data: result
    })
});

// DELETE ADMIN DATA BY ID
const deleteAdminById = catchAsync(async (req: Request, res: Response) => {

    const result = await AdminService.deleteAdminById(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin data soft deleted successfully",
        data: result
    })
});

export const AdminController = {
    getAllAdminData,
    getAdminById,
    softDeleteAdminById,
    deleteAdminById
}
