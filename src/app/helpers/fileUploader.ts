import httpStatus from 'http-status';
import { Request } from "express";
import { fileUploader } from "./multer.helper";
import { AppError } from "./AppError";

// UPLOAD IMAGE COMMON FUNCTION 
export const uploadImage = async (req: Request) => {
    if (req.file) {
        const uploadResult = await fileUploader.uploadToCloudinary(req.file);
        if (!uploadResult?.secure_url) {
            throw new AppError(httpStatus.BAD_REQUEST, "Profile Image Upload Failed.");
        }
        const photoUrl = uploadResult?.secure_url;
        return photoUrl;
    }
};