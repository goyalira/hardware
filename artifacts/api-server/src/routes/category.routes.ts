import { Router, type IRouter } from "express";
import * as categoryController from "../controllers/category.controller";
import { protect, adminOnly } from "../middlewares/auth.middleware";

const router: IRouter = Router();

router.get("/", categoryController.listCategories);
router.get("/:slug", categoryController.getCategory);
router.post("/", protect, adminOnly, categoryController.createCategory);
router.put("/:id", protect, adminOnly, categoryController.updateCategory);
router.delete("/:id", protect, adminOnly, categoryController.deleteCategory);

export default router;
