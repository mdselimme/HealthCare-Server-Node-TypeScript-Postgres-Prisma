import { format } from 'date-fns';
import { PaymentStatus, UserRole } from "@prisma/client";
import { IJwtPayload } from "../../interfaces/jwtPayload";
import { AppError } from "../../helpers/AppError";
import httpStatus from "http-status";
import { prisma } from "../../shared/prisma";

const fetchDashboardMetaData = async (decodedToken: IJwtPayload) => {
  let metadata;
  switch (decodedToken.role) {
    case UserRole.ADMIN:
      metadata = await getAdminMetaData();
      break;
    case UserRole.DOCTOR:
      metadata = await getDoctorMetaData(decodedToken);
      break;
    case UserRole.PATIENT:
      metadata = await getPatientMetaData(decodedToken);
      break;
    default:
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid User Role.");
  }
  return metadata;
};

// GET ADMIN METADATA FOR DASHBOARD
const getAdminMetaData = async () => {
  const patientCount = await prisma.patient.count();
  const adminCount = await prisma.admin.count();
  const doctorCount = await prisma.doctor.count();
  const appointmentCount = await prisma.appointment.count();
  const paymentCount = await prisma.payment.count();
  const totalPaidRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });
  const barChartData = await getBarChartData();
  const pieChartData = await getPieChartData();

  return {
    patientCount,
    adminCount,
    doctorCount,
    appointmentCount,
    paymentCount,
    totalPaidRevenue,
    barChartData,
    pieChartData,
  };
};

const getBarChartData = async () => {
  const appointmentCountPerMonth = await prisma.$queryRaw`
  SELECT DATA_TRUNK('month', 'createdAt') AS month,
  CAST(COUNT(*) AS INTEGER) AS count
  FROM "appointment"
  GROUP BY month
  ORDER BY month ASC
  `;
  return appointmentCountPerMonth;
};

const getPieChartData = async () => {
  const appointStatusDistribution = await prisma.user.groupBy({
    by: ["status"],
    _count: { id: true },
  });
  const formatAppointmentStatusDistribution = appointStatusDistribution.map(
    ({ status, _count }) => ({
      status,
      count: Number(_count.id),
    })
  );
  return formatAppointmentStatusDistribution;
};

// GET DOCTOR METADATA FOR DASHBOARD 
const getDoctorMetaData = async (decodedToken: IJwtPayload) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      email: decodedToken.email,
    },
  });
  const appointmentCount = await prisma.appointment.count({
    where: {
      doctorId: doctor?.id,
    },
  });
  const patientCount = await prisma.appointment.groupBy({
    by: ["patientId"],
    _count: { patientId: true },
    where: {
      patientId: doctor?.id,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      doctorId: doctor?.id,
    },
  });

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      appointment: {
        doctorId: doctor?.id,
      },
      status: PaymentStatus.PAID,
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
    where: {
      doctorId: doctor?.id,
    },
  });

  const formatAppointmentStatusDistribution = appointmentStatusDistribution.map(
    ({ status, _count }) => ({
      status,
      count: Number(_count.id),
    })
  );

  const formatPatientCount = patientCount.length;

  return {
    appointmentCount,
    patientCount: formatPatientCount,
    reviewCount,
    totalRevenue,
    appointmentStatusDistribution: formatAppointmentStatusDistribution,
  };
};

//GET PATIENT METADATA FOR DASHBOARD
const getPatientMetaData = async (decodedToken: IJwtPayload) => {

  const patient = await prisma.patient.findUnique({
    where: {
      email: decodedToken.email,
    },
  });

  const appointmentCout = await prisma.appointment.count({
    where: {
      patientId: patient?.id,
    },
  });

  const prescriptionCount = await prisma.prescription.count({
    where: {
      patientId: patient?.id,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      patientId: patient?.id,
    },
  });

  const appointmentDataStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
    where: {
      patientId: patient?.id,
    },
  });

  const formatAppointmentStatusDistribution = appointmentDataStatusDistribution.map(
    ({ status, _count }) => ({
      status,
      count: Number(_count.id),
    })
  );

  return {
    appointmentCout,
    prescriptionCount,
    reviewCount,
    appointmentStatusDistribution: formatAppointmentStatusDistribution,
  };
};

export const MetaDataService = {
  fetchDashboardMetaData,
};
