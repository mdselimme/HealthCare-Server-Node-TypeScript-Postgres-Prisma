import httpStatus from 'http-status';
import Stripe from "stripe";
import { prisma } from "../../shared/prisma";
import { PaymentStatus } from "@prisma/client";
import { AppError } from "../../helpers/AppError";
import { SSLService } from '../SSL/ssl.service';


// INIT PAYMENT SERVICE
const initPayment = async (appointmentId: string) => {
  const paymentData = await prisma.payment.findFirst({
    where: {
      appointmentId
    },
    include: {
      appointment: {
        include: {
          patient: true
        }
      }
    }
  });

  if (!paymentData) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment data not found");
  };

  const initPaymentData = {
    amount: paymentData.amount,
    transactionId: paymentData.transactionId,
    name: paymentData.appointment.patient.name,
    email: paymentData.appointment.patient.email,
    address: paymentData.appointment.patient.address,
    phoneNumber: paymentData.appointment.patient.contactNumber,
  };

  const result = await SSLService.initPayment(initPaymentData);

  return {
    paymentUrl: result.GatewayPageURL,
  };
};

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;

      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;

      await prisma.appointment.update({
        where: {
          id: appointmentId,
        },
        data: {
          paymentStatus:
            session.payment_status === "paid"
              ? PaymentStatus.PAID
              : PaymentStatus.UNPAID,
        },
      });

      await prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status:
            session.payment_status === "paid"
              ? PaymentStatus.PAID
              : PaymentStatus.UNPAID,
          paymentGatewayData: session,
        },
      });

      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }
};

export const PaymentService = {
  handleStripeWebhookEvent,
  initPayment
};
