import { Router } from "express";
import { PaymentController } from "./payment.controller";

const router = Router();

// PAYMENT VALIDATE 
router.get('/ipn', PaymentController.validatePayment);

// PAYMENT INIT DATA 
router.post('/init-payment/:appointmentId',
    PaymentController.initPayment
)

export const PaymentRouter = router;
