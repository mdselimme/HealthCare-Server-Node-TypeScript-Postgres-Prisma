import httpStatus from "http-status";
import { AppError } from "../../helpers/AppError";
import { IJwtPayload } from "../../interfaces/jwtPayload";
import { prisma } from "../../shared/prisma";
import { v4 as uuidv4 } from "uuid";
import { stripe } from "../../helpers/stripe";
import { calculatePagination, IOptions } from "../../helpers/paginationHelpers";
import { AppointmentStatus, Prisma, UserRole } from "@prisma/client";
import { off } from "process";
// CREATE AN APPOINTMENT
const createAnAppointment = async (
  decodedToken: IJwtPayload,
  payload: { doctorId: string; scheduleId: string }
) => {
  console.log({ decodedToken, payload });
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: decodedToken.email,
      isDeleted: false,
    },
  });
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });
  const scheduleData = await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: payload.doctorId,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });
  const videoCallingId = uuidv4();
  const appointCreateData = {
    ...payload,
    patientId: patientData.id,
    videoCallingId,
  };

  const result = await prisma.$transaction(async (trx) => {
    const appointmentData = await trx.appointment.create({
      data: appointCreateData,
    });
    await trx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    const transactionId = `${uuidv4()}-${Date.now()}`;

    const paymentData = await trx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: decodedToken.email,
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Appointment with ${doctorData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointmentData.id,
        paymentId: paymentData.id,
      },
      success_url: `https://www.programming-hero.com/`,
      cancel_url: `https://next.programming-hero.com/`,
    });

    return { paymentUrl: session.url };
  });

  return result;
};

// GET MY APPOINTMENT
const getMyAppointment = async (
  decodedToken: IJwtPayload,
  filters: any,
  options: IOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const { ...filterData } = filters;

  const andConditions: Prisma.AppointmentWhereInput[] = [];

  if (decodedToken.role === UserRole.PATIENT) {
    andConditions.push({
      patient: {
        email: decodedToken.email,
      },
    });
  } else if (decodedToken.role === UserRole.DOCTOR) {
    andConditions.push({
      doctor: {
        email: decodedToken.email,
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));

    andConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include:
      decodedToken.role === UserRole.DOCTOR
        ? { patient: true }
        : { doctor: true },
  });

  const total = await prisma.appointment.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      limit,
      page,
    },
    data: result,
  };
};

// UPDATE APPOINTMENT STATUS
const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  decodedToken: IJwtPayload
) => {
  const appointmentData = await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
    },
    include: {
      doctor: true,
    },
  });
  if (!appointmentData) {
    throw new AppError(httpStatus.BAD_REQUEST, "No appointment data found.");
  }
  if (decodedToken.role === UserRole.DOCTOR) {
    if (!(decodedToken.email === appointmentData.doctor.email))
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This is not your appointment"
      );
  }

  return await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status,
    },
  });
};

// AUTO REMOVE UNPAID APPOINTMENT
const cancelUnpaidAppointment = async () => {
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  const unPaidAppointments = await prisma.appointment.findMany({
    where: {
      createdAt: {
        lte: thirtyMinAgo,
      },
    },
  });

  const appointIdsToCancel = unPaidAppointments.map(
    (appointment) => appointment.id
  );

  await prisma.$transaction(async (trx) => {
    await trx.payment.deleteMany({
      where: {
        appointmentId: {
          in: appointIdsToCancel,
        },
      },
    });
    await trx.appointment.deleteMany({
      where: {
        id: {
          in: appointIdsToCancel,
        },
      },
    });
    for (const unPaidAppointment of unPaidAppointments) {
      await trx.doctorSchedules.update({
        where: {
          doctorId_scheduleId: {
            doctorId: unPaidAppointment.doctorId,
            scheduleId: unPaidAppointment.scheduleId,
          },
        },
        data: {
          isBooked: false,
        },
      });
    }
  });
};

export const AppointmentServices = {
  createAnAppointment,
  getMyAppointment,
  updateAppointmentStatus,
  cancelUnpaidAppointment,
};
