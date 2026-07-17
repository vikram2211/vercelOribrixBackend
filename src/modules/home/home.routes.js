import express from "express";
import { getMobileHomeData } from "./home.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Apply authenticate middleware so we have access to req.user.userId
router.get("/", authenticate, getMobileHomeData);

export default router;
