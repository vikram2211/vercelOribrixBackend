import Site from "../site/site.model.js";
import Category from "../category/category.model.js";
import Product from "../product/product.model.js";
import VendorProduct from "../vendorProduct/vendorProduct.model.js";

export const findFirstSiteByUserId = async (userId) => {
    return await Site.findOne({ userId, isDelete: false })
        .sort({ createdAt: 1 })
        .select("siteName siteAddress pinCode")
        .lean();
};

export const findTopCategories = async (limit = 6) => {
    return await Category.find({ isActive: true })
        .limit(limit)
        .select("name image")
        .lean();
};

export const findTrendingVendorProducts = async (limit = 1) => {
    return await VendorProduct.find({ status: "ACTIVE" })
        .populate("productId", "name thumbnail images")
        .limit(limit)
        .lean();
};

export const findRecentProducts = async (limit = 5) => {
    return await Product.find({ isActive: true })
        .limit(limit)
        .select("name")
        .lean();
};
