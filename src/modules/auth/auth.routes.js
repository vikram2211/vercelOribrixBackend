import express from "express";
import * as authController from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { uploadProfile } from "../../middleware/upload.middleware.js";

const router = express.Router();

router.post("/register", uploadProfile.single('photo'), authController.register);
router.post("/verify-otp", authController.verifyOtp);
router.post("/send-otp", authController.sendOtp);
router.post("/login", authController.login);
router.post("/customer-login", authController.customerLogin);
router.post("/onboard", authenticate, authController.onboard); // Protected: requires valid JWT
<<<<<<< HEAD
router.post("/refresh-token", authController.refreshToken);
=======
router.post("/change-password", authenticate, authController.changePassword); // Protected: requires valid JWT
<<<<<<< HEAD
>>>>>>> dff7fb0 (updated apis)
=======
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
>>>>>>> 0f22cc5 (Add admin profile management and password reset functionality)

export default router;