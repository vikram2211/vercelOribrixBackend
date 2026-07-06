import express from "express";
import * as authController from "./auth.controller.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOtp);
router.post("/send-otp", authController.sendOtp);
router.post("/login", authController.login);
router.post("/customer-login", authController.customerLogin);
router.post("/onboard", authController.onboard); // In real app, apply Auth middleware here
// router.post("/onboard/:userId", authController.onboard); 

export default router;
