import { Router, type IRouter } from "express";
import * as productController from "../controllers/product.controller";
import { protect, adminOnly } from "../middlewares/auth.middleware";

const router: IRouter = Router();

router.get("/", productController.listProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/brands", productController.listBrands);
router.get("/low-stock", protect, adminOnly, productController.lowStockProducts);
router.get("/:slug", productController.getProduct);
router.post("/", protect, adminOnly, productController.createProduct);
router.put("/:id", protect, adminOnly, productController.updateProduct);
router.patch("/:id/stock", protect, adminOnly, productController.updateStock);
router.delete("/:id", protect, adminOnly, productController.deleteProduct);

export default router;
