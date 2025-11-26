import httpStatus from 'http-status';
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { stripe } from "../../helpers/stripe";
import { PaymentService } from "./payment.service";
import sendResponse from "../../shared/sendResponse";
import config from "../../../config";

// INIT PAYMENT SERVICE 
const initPayment = catchAsync(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const result = await PaymentService.initPayment(appointmentId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment initiate successfully',
    data: result,
  });
});



const handleStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = config.web_hook_secret;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret as string
      );
    } catch (err: any) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    const result = await PaymentService.handleStripeWebhookEvent(event);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Webhook req send successfully",
      data: result,
    });
  }
);

export const PaymentController = {
  handleStripeWebhookEvent,
  validatePayment,
  initPayment
};
