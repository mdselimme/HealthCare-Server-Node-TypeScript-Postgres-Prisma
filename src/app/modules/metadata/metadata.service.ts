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
      metadata = "doctor_metadata";
      break;
    case UserRole.PATIENT:
      metadata = "patient_metadata";
      break;
    default:
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid User Role.");
  }
  return metadata;
};

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
  //   const barChartData = await getBarChartData();
  const pieChartData = await getPieChartData();
  console.log({
    patientCount,
    adminCount,
    doctorCount,
    appointmentCount,
    paymentCount,
    totalPaidRevenue,
    // barChartData,
    pieChartData,
  });
  return {
    patientCount,
    adminCount,
    doctorCount,
    appointmentCount,
    paymentCount,
    totalPaidRevenue,
    // barChartData,
    pieChartData,
  };
};

// const getBarChartData = async () => {
//   const appointmentCountPerMonth = await prisma.$queryRaw`
//   SELECT DATA_TRUNK('month', 'createdAt') AS month,
//   CAST(COUNT(*) AS INTEGER) AS count
//   FROM "appointment"
//   GROUP BY month
//   ORDER BY month ASC
//   `;
//   return appointmentCountPerMonth;
// };

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

export const MetaDataService = {
  fetchDashboardMetaData,
};
