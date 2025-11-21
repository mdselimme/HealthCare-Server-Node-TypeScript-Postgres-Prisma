import { Gender } from "@prisma/client";

export interface IDoctorUpdate {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
  registrationNumber?: string;
  experience?: number;
  gender?: Gender;
  appointmentFee?: number;
  qualification?: string;
  currentWorkingPlace?: string;
  designation?: string;
  specialties?: string[];
  removeSpecialties?: string[];
};

export interface IDoctorFilterRequest {
  searchTerm?: string | undefined;
  email?: string | undefined;
  contactNumber?: string | undefined;
  gender?: string | undefined;
  specialties?: string | undefined;
};
