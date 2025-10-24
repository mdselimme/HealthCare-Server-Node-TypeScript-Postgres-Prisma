import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import { DoctorScheduleService } from './doctorSchedule.service';
import { Request, Response } from 'express';
import sendResponse from '../../shared/sendResponse';
import { JwtPayload } from 'jsonwebtoken';
import { IJwtPayload } from '../../interfaces/jwtPayload';



// DOCTOR SCHEDULE CREATE
const createDoctorSchedule = catchAsync(async (req: Request, res: Response) => {

    const user = req.user;

    const result = await DoctorScheduleService.doctorScheduleService(user as IJwtPayload, req.body);


    sendResponse(res, {
        success: true,
        message: "Doctor Schedule Created Successfully",
        data: result,
        statusCode: httpStatus.CREATED,
    });
});

// DOCTOR SCHEDULE GET 
const doctorScheduleAll = catchAsync(async (req: Request, res: Response) => {

    const decodedToken = req.user;

    const result = await DoctorScheduleService.doctorScheduleGetAll(decodedToken as IJwtPayload);

    sendResponse(res, {
        success: true,
        message: "Doctor Schedule Retrieved Successfully",
        data: result,
        statusCode: httpStatus.CREATED,
    });
});

// DOCTOR SCHEDULE GET 
const deleteDoctorSchedule = catchAsync(async (req: Request, res: Response) => {

    await DoctorScheduleService.deleteDoctorScheduleService(req.params.id);


    sendResponse(res, {
        success: true,
        message: "Doctor Schedule Deleted Successfully",
        data: null,
        statusCode: httpStatus.OK,
    });
});

export const DoctorScheduleController = {
    createDoctorSchedule,
    doctorScheduleAll,
    deleteDoctorSchedule
};
