import { Request } from "express";
import { prisma } from "../../shared/prisma";
import { Specialties } from "@prisma/client";
import { uploadImage } from "../../helpers/fileUploader";

const inserIntoDB = async (req: Request) => {


    if (req.file) {
        const imageUrl = await uploadImage(req);
        req.body.icon = imageUrl;
    }

    const result = await prisma.specialties.create({
        data: req.body
    });

    return result;
};

const getAllFromDB = async (): Promise<Specialties[]> => {
    return await prisma.specialties.findMany();
}

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
    deleteFromDB
}