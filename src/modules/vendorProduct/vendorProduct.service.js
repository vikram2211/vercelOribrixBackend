import * as vendorProductRepo from "./vendorProduct.repository.js";
import Product from "../product/product.model.js";
import ApiError from "../../utils/ApiError.js";

export const addVendorListing = async (vendorId, listingData) => {
    if (!vendorId || !listingData.productId) {
        throw new ApiError(400, "Vendor ID and Product ID are required");
    }

    if (listingData.sellingPrice > listingData.mrp) {
        throw new ApiError(400, "Selling price cannot be greater than MRP");
    }

    try {
        const newListing = await vendorProductRepo.createListing({
            ...listingData,
            vendorId
        });

        // Return populated version explicitly safely
        return newListing;
    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(400, "You have already listed this product. Please update your existing listing.");
        }
        throw error;
    }
};

export const getVendorListings = async (vendorId) => {
    return await vendorProductRepo.findListingsByVendor(vendorId);
};

export const getListingDetails = async (listingId) => {
    const listing = await vendorProductRepo.findListingById(listingId);
    if (!listing) {
        throw new ApiError(404, "Product listing not found");
    }

    const p = listing.productId;
    const v = listing.vendorId;
    const w = listing.warehouseId;

    // Map attributeValueIds -> [{name: "Grade", value: "800x800"}, ...]
    const attributes = (p?.attributeValueIds || []).map(av => ({
        name: av.attributeId?.name || "Attribute",
        value: av.value
    }));

    return {
        listingId: listing._id,

        product: {
            name: p?.name,
            description: p?.description,
            thumbnail: p?.thumbnail,
            images: p?.images || [],
            brand: p?.brandId?.name,
            category: p?.categoryId?.name,
            subCategory: p?.subCategoryId?.name,
            attributes
        },

        pricing: {
            mrp: listing.mrp,
            sellingPrice: listing.sellingPrice,
            discountPercentage: listing.mrp
                ? Math.round(((listing.mrp - listing.sellingPrice) / listing.mrp) * 100)
                : 0
        },

        inventory: {
            stockQuantity: listing.stockQuantity,
            minOrderQuantity: listing.minOrderQuantity,
            status: listing.stockQuantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK"
        },

        seller: {
            vendorId: v?._id,
            name: v?.businessDetails?.legalBusinessName,
            isKycVerified: v?.status === "APPROVED"
        },

        warehouse: {
            warehouseId: w?._id,
            name: w?.name,
            address: w?.address,
            operatingHours: w?.operatingHours
        }
    };
};

export const searchVendorProducts = async (filters, { page, limit, skip }) => {
    const query = { status: "ACTIVE" };

    // Support filtering purely by broad Category
    if (filters.categoryId) {
        const matchingProducts = await Product.find({ categoryId: filters.categoryId }).select('_id');
        query.productId = { $in: matchingProducts.map(p => p._id) };
    }

    // Support highly specific Sub-Category filtering (Overrides Category)
    if (filters.subCategoryId) {
        const matchingProducts = await Product.find({ subCategoryId: filters.subCategoryId }).select('_id');
        query.productId = { $in: matchingProducts.map(p => p._id) };
    }

    if (filters.vendorId) {
        query.vendorId = filters.vendorId;
    }

    // Determine exactly how many unique Master Products currently have active listings matching this query
    const distinctProductIds = await vendorProductRepo.getDistinctProductIds(query);
    const total = distinctProductIds.length;

    // Slice exactly the product IDs needed for this specific page
    const paginatedProductIds = distinctProductIds.slice(skip, skip + limit);

    // Override the query to ONLY fetch listings belonging to the sliced Master Products
    query.productId = { $in: paginatedProductIds };

    const rawListings = await vendorProductRepo.findAllListings(query);

    // Group the raw data by Master Product for a clean UI render
    const groupedProducts = Object.values(rawListings.reduce((acc, listing) => {
        // Safety check to ensure broken references are ignored
        if (!listing.productId) return acc;

        const masterId = listing.productId._id.toString();

        // 1. Structure the Master Product Header
        if (!acc[masterId]) {
            acc[masterId] = {
                productId: masterId,
                name: listing.productId.name,
                slug: listing.productId.slug,
                thumbnail: listing.productId.thumbnail,
                brandName: listing.productId.brandId?.name,
                categoryName: listing.productId.categoryId?.name,
                subCategoryName: listing.productId.subCategoryId?.name,
                warehouses: []
            };
        }

        // 2. Push the highly specific vendor/warehouse listing details inside
        acc[masterId].warehouses.push({
            listingId: listing._id,
            vendorId: listing.vendorId?._id,
            vendorName: listing.vendorId?.businessDetails?.legalBusinessName || "Verified Vendor",
            warehouseName: listing.warehouseId?.name || "Local Warehouse",
            warehouseAddress: listing.warehouseId?.address || "",
            mrp: listing.mrp,
            sellingPrice: listing.sellingPrice,
            stockQuantity: listing.stockQuantity,
            minOrderQuantity: listing.minOrderQuantity
        });

        return acc;
    }, {}));

    return {
        products: groupedProducts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 0
        }
    };
};

export const updateVendorListing = async (id, vendorId, updateData) => {
    if (updateData.sellingPrice && updateData.mrp && updateData.sellingPrice > updateData.mrp) {
        throw new ApiError(400, "Selling price cannot be greater than MRP");
    }

    const listing = await vendorProductRepo.updateListing(id, vendorId, updateData);
    if (!listing) {
        throw new ApiError(404, "Product listing not found in your catalog");
    }
    return listing;
};

export const deleteVendorListing = async (id, vendorId) => {
    const listing = await vendorProductRepo.removeListing(id, vendorId);
    if (!listing) {
        throw new ApiError(404, "Product listing not found");
    }
    return true;
};
