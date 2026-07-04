import { Router, type IRouter } from "express";
import * as userController from "../controllers/user.controller";
import { protect, adminOnly } from "../middlewares/auth.middleware";

const router: IRouter = Router();

router.use(protect, adminOnly);

router.get("/", userController.listUsers);
router.get("/:id", userController.getUser);
router.patch("/:id/status", userController.updateUserStatus);
router.delete("/:id", userController.deleteUser);

export default router;
