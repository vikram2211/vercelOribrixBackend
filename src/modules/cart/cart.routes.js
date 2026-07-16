import express from "express";
import {
    getCart,
    upsertCartItem,
    removeFromCart,
    clearCart
} from "./cart.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

// All cart routes require user to be authenticated and have CUSTOMER role
router.use(authenticate);
router.use(authorize("CUSTOMER")); // Require CUSTOMER role

router.get("/", getCart);
router.patch("/item", upsertCartItem); // Unified Upsert (Add/Update) API
router.delete("/remove/:cartItemId", removeFromCart);
router.delete("/clear", clearCart);

export default router;
