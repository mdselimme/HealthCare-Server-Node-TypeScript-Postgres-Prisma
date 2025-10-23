import httpStatus from 'http-status';
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { Request, Response } from 'express';
import { ScheduleService } from './schedule.service';
import { searchQuery } from '../../helpers/searchQuery';


// DOCTOR SCHEDULE CREATE
const scheduleCreate = catchAsync(async (req: Request, res: Response) => {

    const result = await ScheduleService.scheduleCreateService(req.body);


    sendResponse(res, {
        success: true,
        message: "Schedule Created Successfully",
        data: result,
        statusCode: httpStatus.CREATED,
    });
});

// DOCTOR SCHEDULE GET 
const doctorScheduleAll = catchAsync(async (req: Request, res: Response) => {

    const options = searchQuery(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filter = searchQuery(req.query, ["startDateTime", "endDateTime"])

    const result = await ScheduleService.doctorScheduleAll(options, filter);


    sendResponse(res, {
        success: true,
        message: "Schedule Retrieved Successfully",
        data: result,
        statusCode: httpStatus.CREATED,
    });
});

// DOCTOR SCHEDULE GET 
const deleteDoctorSchedule = catchAsync(async (req: Request, res: Response) => {


    await ScheduleService.deleteDoctorSchedule(req.params.id);


    sendResponse(res, {
        success: true,
        message: "Schedule Deleted Successfully",
        data: null,
        statusCode: httpStatus.OK,
    });
});

export const ScheduleController = {
    scheduleCreate,
    doctorScheduleAll,
    deleteDoctorSchedule
};
