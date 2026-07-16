import Cart from "./cart.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import { sendResponse } from "../../utils/response.js";
import mongoose from "mongoose";

// Helper for deep population
const populateCart = [
    {
        path: "items.vendorProductId",
        populate: {
            path: "productId",
            populate: [
                { path: "brandId", select: "name" },
                { path: "subCategoryId", select: "name" },
                { path: "attributeValueIds", select: "value" }
            ]
        }
    }
];

// Helper to flatten response for mobile app
const formatCartResponse = (cart) => {
    if (!cart) return { cartId: null, items: [], cartTotal: 0 };

    let cartTotal = 0;
    const formattedItems = cart.items.map(item => {
        const vp = item.vendorProductId;
        if (!vp) return null;

        const p = vp.productId;
        if (!p) return null;

        const brandName = p.brandId?.name || "";
        const subCatName = p.subCategoryId?.name || "";
        const attributes = (p.attributeValueIds || []).map(attr => attr.value).join(" ");

        // e.g., "UltraTech Super Cement (UltraTech Cement 53 Grade)"
        const displayName = `${p.name} (${brandName} ${subCatName} ${attributes})`.replace(/\s+/g, " ").replace(/\(\s+/g, "(").trim();

        const itemTotal = vp.sellingPrice * item.quantity;
        cartTotal += itemTotal;

        return {
            vendorProductId: vp._id,
            productName: displayName,
            image: p.thumbnail,
            quantity: item.quantity,
            price: vp.sellingPrice,
            totalAmount: itemTotal,
            vendorId: vp.vendorId, // May be useful for order segregation
            stockQuantity: vp.stockQuantity
        };
    }).filter(i => i !== null);

    return {
        cartId: cart._id,
        userId: cart.userId,
        items: formattedItems,
        cartTotal
    };
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private (CUSTOMER)
export const getCart = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    let cart = await Cart.findOne({ userId }).populate(populateCart);

    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
    }

    sendResponse(res, 200, "Cart retrieved successfully", formatCartResponse(cart));
});

// @desc    Add or update item in cart (Upsert logic - Absolute Quantity)
// @route   PATCH /api/cart/item
// @access  Private (CUSTOMER)
export const upsertCartItem = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { vendorProductId, quantity } = req.body;

    if (!vendorProductId || quantity === undefined) {
        throw new ApiError(400, "Vendor Product ID and quantity are required.");
    }

    if (quantity < 1) {
        throw new ApiError(400, "Quantity must be at least 1. Use the remove API to delete the item.");
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
        cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.vendorProductId.toString() === vendorProductId
    );

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
    } else {
        cart.items.push({ vendorProductId, quantity });
    }

    await cart.save();
    cart = await cart.populate(populateCart);

    sendResponse(res, 200, "Cart updated successfully", formatCartResponse(cart));
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:vendorProductId
// @access  Private (CUSTOMER)
export const removeFromCart = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { vendorProductId } = req.params;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new ApiError(404, "Cart not found.");
    }

    cart.items = cart.items.filter(
        (item) => item.vendorProductId.toString() !== vendorProductId
    );

    await cart.save();
    cart = await cart.populate(populateCart);

    sendResponse(res, 200, "Item removed from cart", formatCartResponse(cart));
});

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private (CUSTOMER)
export const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new ApiError(404, "Cart not found.");
    }

    cart.items = [];
    await cart.save();

    sendResponse(res, 200, "Cart cleared successfully", formatCartResponse({ ...cart.toObject(), items: [] }));
});
