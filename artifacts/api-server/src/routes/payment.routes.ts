import { Router, type IRouter } from "express";
import * as paymentController from "../controllers/payment.controller";
import { protect } from "../middlewares/auth.middleware";

const router: IRouter = Router();

router.post("/razorpay/order", protect, paymentController.createRazorpayOrder);
router.post("/razorpay/verify", protect, paymentController.verifyRazorpayPayment);

export default router;