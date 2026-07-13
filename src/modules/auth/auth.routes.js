import express from "express";
import * as authController from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOtp);
router.post("/send-otp", authController.sendOtp);
router.post("/login", authController.login);
router.post("/customer-login", authController.customerLogin);
router.post("/onboard", authenticate, authController.onboard); // Protected: requires valid JWT

export default router;