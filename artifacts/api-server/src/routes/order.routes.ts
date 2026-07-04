import { Router, type IRouter } from "express";
import * as orderController from "../controllers/order.controller";
import { protect, adminOnly } from "../middlewares/auth.middleware";

const router: IRouter = Router();

router.post("/", protect, orderController.createOrder);
router.get("/my", protect, orderController.getMyOrders);
router.get("/", protect, adminOnly, orderController.listAllOrders);
router.get("/:id", protect, orderController.getOrder);
router.get("/:id/tracking", protect, orderController.getOrderTracking);
router.patch("/:id/status", protect, adminOnly, orderController.updateOrderStatus);

export default router;
