import config from "../../../config";
import { prisma } from "../../shared/prisma";
import { IPatientInput } from "./user.interface"
import bcrypt from "bcryptjs";

// CREATE PATIENT SERVICE FUNCTION 
const createPatientService = async (payload: IPatientInput) => {

    const hashPassword = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_round));

    const result = await prisma.$transaction(async (tnx) => {
        await tnx.user.create({
            data: {
                email: payload.email,
                password: hashPassword,
            }
        });
        return await tnx.patient.create({
            data: {
                name: payload.name,
                email: payload.email
            }
        });
    });
    return result;
};

export const UserService = {
    createPatientService,
}