import { Router, type IRouter } from "express";
import * as adminController from "../controllers/admin.controller";
import { protect, adminOnly } from "../middlewares/auth.middleware";

const router: IRouter = Router();

router.use(protect, adminOnly);

router.get("/analytics/summary", adminController.getAnalyticsSummary);
router.get("/analytics/sales", adminController.getSalesOverTime);
router.get("/analytics/top-products", adminController.getTopProducts);
router.get("/analytics/order-status", adminController.getOrderStatusBreakdown);

export default router;
