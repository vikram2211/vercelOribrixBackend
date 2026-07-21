import * as vendorProductRepo from "./vendorProduct.repository.js";
import Product from "../product/product.model.js";
import { addProduct } from "../product/product.service.js";
import Cart from "../cart/cart.model.js";
import Category from "../category/category.model.js";
import SubCategory from "../subCategory/subCategory.model.js";
import Brand from "../brand/brand.model.js";
import Warehouse from "../warehouse/warehouse.model.js";
import Attribute from "../attribute/attribute.model.js";
import AttributeValue from "../attributeValue/attributeValue.model.js";
import Unit from "../unit/unit.model.js";
import ApiError from "../../utils/ApiError.js";

export const addVendorListing = async (vendorId, listingData) => {
    let finalProductId = listingData.productId;

    // If the vendor is creating a brand new Master Product
    if (listingData.createNewMaster && listingData.masterData) {
        // Enforce that vendor-created master products are hidden until admin approval
        const masterPayload = {
            ...listingData.masterData,
            isActive: false
        };
        const newMaster = await addProduct(masterPayload);
        finalProductId = newMaster._id;
    }

    if (!vendorId || !finalProductId) {
        throw new ApiError(400, "Vendor ID and Product ID (or new Master Data) are required");
    }

    if (listingData.sellingPrice > listingData.mrp) {
        throw new ApiError(400, "Selling price cannot be greater than MRP");
    }

    try {
        const vendorProductPayload = {
            ...listingData,
            productId: finalProductId, // Guarantee we use the right ID
            vendorId
        };
        // Clean up fields that don't belong in vendorProduct schema (e.g., masterData, createNewMaster)
        delete vendorProductPayload.masterData;
        delete vendorProductPayload.createNewMaster;

        const newListing = await vendorProductRepo.createListing(vendorProductPayload);

        // Return populated version explicitly safely
        return newListing;
    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(400, "You have already listed this product. Please update your existing listing.");
        }
        throw error;
    }
};

export const bulkAddVendorListings = async (vendorId, products) => {
    const results = { successful: 0, failed: 0, errors: [] };

    for (const [index, row] of products.entries()) {
        try {
            // 1. Resolve Warehouse purely by Vendor's string name input
            if (!row.WarehouseName) throw new Error("WarehouseName is required");
            const warehouse = await Warehouse.findOne({ vendorId, name: { $regex: new RegExp(`^${row.WarehouseName.trim()}$`, 'i') } });
            if (!warehouse) throw new Error(`Warehouse '${row.WarehouseName}' not found for your account`);

            let finalProductId = row.MasterProductId;

            // 2. If no explicit MasterProductId, we resolve strings to create/find Master Product
            if (!finalProductId) {
                if (!row.ProductName || !row.CategoryName || !row.BrandName || !row.MRP || !row.SellingPrice || !row.StockQuantity || !row.Unit) {
                    throw new Error("Missing required fields for product mapping (ProductName, CategoryName, BrandName, Unit, MRP, SellingPrice, Stock)");
                }

                // Check if a Master already exists by exactly this name
                let existingMaster = await Product.findOne({ name: { $regex: new RegExp(`^${row.ProductName.trim()}$`, 'i') } });

                if (existingMaster) {
                    finalProductId = existingMaster._id;
                } else {
                    // Start Deep Resolution for a brand new Master
                    const category = await Category.findOne({ name: { $regex: new RegExp(`^${row.CategoryName.trim()}$`, 'i') } });
                    if (!category) throw new Error(`Category '${row.CategoryName}' not found in system`);

                    const brand = await Brand.findOne({ name: { $regex: new RegExp(`^${row.BrandName.trim()}$`, 'i') } });
                    if (!brand) throw new Error(`Brand '${row.BrandName}' not found in system`);

                    const unitStr = row.Unit.trim();
                    const unitDb = await Unit.findOne({ name: { $regex: new RegExp(`^${unitStr}$`, 'i') } });
                    if (!unitDb) throw new Error(`Unit '${unitStr}' not found in system. Please use a standard unit name.`);

                    let subCategoryId = null;
                    if (row.SubCategoryName) {
                        const subcat = await SubCategory.findOne({ name: { $regex: new RegExp(`^${row.SubCategoryName.trim()}$`, 'i') }, categoryId: category._id });
                        if (!subcat) throw new Error(`SubCategory '${row.SubCategoryName}' not found under matching Category`);
                        subCategoryId = subcat._id;
                    }

                    // Process Attribute mappings dynamically based on generic CSV columns
                    const attributeValueIds = [];
                    const maxAttributesToScan = 5; // Support up to 5 pairs
                    for (let i = 1; i <= maxAttributesToScan; i++) {
                        const attrNameKeys = [`Attribute${i}_Name`, `Attribute ${i} Name`];
                        const attrValKeys = [`Attribute${i}_Value`, `Attribute ${i} Value`];

                        let attrNameStr = null;
                        let attrValStr = null;

                        for (const key of attrNameKeys) if (row[key]) attrNameStr = row[key].trim();
                        for (const key of attrValKeys) if (row[key]) attrValStr = row[key].trim();

                        if (attrNameStr && attrValStr) {
                            // 1. Find the Attribute in this category
                            const attrDb = await Attribute.findOne({ categoryId: category._id, name: { $regex: new RegExp(`^${attrNameStr}$`, 'i') } });
                            if (attrDb) {
                                // 2. Find the Attribute Value mapping to this Attribute
                                const valDb = await AttributeValue.findOne({ attributeId: attrDb._id, value: { $regex: new RegExp(`^${attrValStr}$`, 'i') } });
                                if (valDb) {
                                    attributeValueIds.push(valDb._id);
                                }
                            }
                        }
                    }

                    // Dynamically create the new Master (pending approval) using the shared service to auto-generate slugs!
                    const imagesArray = row.ProductImages ? row.ProductImages.split(',').map(img => img.trim()).filter(Boolean) : [];

                    const newMaster = await addProduct({
                        name: row.ProductName.trim(),
                        description: row.ProductDescription || '',
                        images: imagesArray,
                        thumbnail: imagesArray.length > 0 ? imagesArray[0] : null,
                        weight: row.Weight || null,
                        countryOfOrigin: row.CountryOfOrigin || 'India',
                        unit: unitDb.name, // Use the proper DB-normalized unit name
                        categoryId: category._id,
                        subCategoryId: subCategoryId,
                        brandId: brand._id,
                        hsnCode: row.HSN || null,
                        gstPercentage: row.GST || 18,
                        attributeValueIds,
                        isActive: false
                    });
                    finalProductId = newMaster._id;
                }
            }

            // 3. Create the unique Vendor Product listing joining the Master and Warehouse
            const isCod = row.CODAvailable && String(row.CODAvailable).trim().toLowerCase() === 'yes';
            const priceType = row.PriceType && String(row.PriceType).trim().toLowerCase().includes('inclusive')
                ? "Inclusive of GST"
                : "Exclusive of GST";

            await vendorProductRepo.createListing({
                vendorId,
                productId: finalProductId,
                warehouseId: warehouse._id,
                mrp: Number(row.MRP),
                sellingPrice: Number(row.SellingPrice),
                priceType,
                isCodAvailable: isCod,
                stockQuantity: Number(row.StockQuantity),
                minOrderQuantity: Number(row.MinOrderQty) || 1,
                warranty: row.Warranty || '',
                returnPolicy: row.ReturnPolicy || ''
            });

            results.successful++;
        } catch (err) {
            if (err.code === 11000) {
                results.errors.push(`Row ${index + 2}: Duplicate listing - You already have this product at this warehouse.`);
            } else {
                results.errors.push(`Row ${index + 2} (${row.ProductName || row.MasterProductId || 'Unknown'}): ${err.message}`);
            }
            results.failed++;
        }
    }
    return results;
};

export const getVendorListings = async (vendorId, { page = 1, limit = 10, skip = 0, warehouseId } = {}) => {
    const filters = {};
    if (warehouseId) filters.warehouseId = warehouseId;

    const listings = await vendorProductRepo.findListingsByVendor(vendorId, { skip, limit, filters });
    const total = await vendorProductRepo.countListingsByVendor(vendorId, filters);

    return {
        listings,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit) || 0
        }
    };
};

export const getListingDetails = async (listingId, userId) => {
    const listing = await vendorProductRepo.findListingById(listingId);
    if (!listing) {
        throw new ApiError(404, "Product listing not found");
    }

    const p = listing.productId;
    const v = listing.vendorId;
    const w = listing.warehouseId;

    const attributes = (p?.attributeValueIds || []).map(av => ({
        name: av.attributeId?.name || "Attribute",
        value: av.value
    }));

    let cartCount = 0;
    if (userId) {
        const cart = await Cart.findOne({ userId });
        if (cart && cart.items) {
            const cartItem = cart.items.find(item => item.vendorProductId && item.vendorProductId.toString() === listingId.toString());
            if (cartItem) {
                cartCount = cartItem.quantity;
            }
        }
    }

    return {
        listingId: listing._id,
        cartCount: cartCount,

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
