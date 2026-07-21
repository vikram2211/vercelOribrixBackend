import VendorProduct from "./vendorProduct.model.js";

export const createListing = async (data) => {
    return await VendorProduct.create(data);
};

export const findListingsByVendor = async (vendorId, { skip, limit, filters = {} } = {}) => {
    let query = VendorProduct.find({ vendorId, isDeleted: { $ne: true }, ...filters })
        .populate({
            path: 'productId',
            select: 'name sku slug thumbnail images description weight countryOfOrigin hsnCode gstPercentage categoryId brandId',
            populate: [
                { path: 'brandId', select: 'name' },
                { path: 'categoryId', select: 'name' }
            ]
        })
        .populate('warehouseId', 'name')
        .sort({ createdAt: -1 });

    if (skip !== undefined && limit !== undefined) {
        query = query.skip(skip).limit(limit);
    }
    return await query;
};

export const countListingsByVendor = async (vendorId, filters = {}) => {
    return await VendorProduct.countDocuments({ vendorId, isDeleted: { $ne: true }, ...filters });
};

export const findListingByIdAndVendor = async (id, vendorId) => {
    return await VendorProduct.findOne({ _id: id, vendorId, isDeleted: { $ne: true } })
        .populate('productId')
        .populate('warehouseId');
};

export const getDistinctProductIds = async (query = {}) => {
    return await VendorProduct.distinct("productId", query);
};

// Deep populated single listing fetch for the Product Detail Page (PDP)
export const findListingById = async (id) => {
    return await VendorProduct.findOne({ _id: id, isDeleted: { $ne: true } })
        .populate({
            path: 'productId',
            select: 'name sku description thumbnail images hsnCode gstPercentage categoryId subCategoryId brandId attributeValueIds',
            populate: [
                { path: 'brandId', select: 'name logo' },
                { path: 'categoryId', select: 'name' },
                { path: 'subCategoryId', select: 'name' },
                {
                    path: 'attributeValueIds',
                    populate: { path: 'attributeId', select: 'name' }
                }
            ]
        })
        .populate('warehouseId', 'name address operatingHours')
        .populate('vendorId', 'businessDetails status');
};

// Powerful search for Buyers OR Vendors to filter by Master Product traits
export const findAllListings = async (query = {}) => {
    return await VendorProduct.find({ ...query, isDeleted: { $ne: true } })
        .populate({
            path: 'productId',
            select: 'name slug thumbnail mfgDate categoryId subCategoryId brandId',
            populate: [
                { path: 'brandId', select: 'name logo' },
                { path: 'categoryId', select: 'name' },
                { path: 'subCategoryId', select: 'name' }
            ]
        })
        .populate('warehouseId', 'name location capacity operatingHours address') // Embeds exact location!
        .populate('vendorId', 'businessDetails.legalBusinessName status')
        .sort({ sellingPrice: 1 }); // Sort cheapest first dynamically
};

export const updateListing = async (id, vendorId, updateData) => {
    return await VendorProduct.findOneAndUpdate(
        { _id: id, vendorId, isDeleted: { $ne: true } },
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate('productId');
};

export const removeListing = async (id, vendorId) => {
    return await VendorProduct.findOneAndUpdate({ _id: id, vendorId }, { isDeleted: true }, { new: true });
};
