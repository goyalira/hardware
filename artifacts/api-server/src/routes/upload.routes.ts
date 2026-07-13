import { Router, type IRouter } from "express";
import multer from "multer";
import * as uploadController from "../controllers/upload.controller";
import { protect, adminOnly } from "../middlewares/auth.middleware";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

const router: IRouter = Router();

router.post("/", protect, adminOnly, upload.single("image"), uploadController.uploadImage);

export default router;
