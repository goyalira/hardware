import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import orderRoutes from "./order.routes";
import userRoutes from "./user.routes";
import adminRoutes from "./admin.routes";

const router: IRouter = Router();

router.use(healthRouter);

const v1: IRouter = Router();
v1.use("/auth", authRoutes);
v1.use("/categories", categoryRoutes);
v1.use("/products", productRoutes);
v1.use("/orders", orderRoutes);
v1.use("/users", userRoutes);
v1.use("/admin", adminRoutes);

router.use("/v1", v1);

export default router;
