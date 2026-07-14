import VendorProduct from "./vendorProduct.model.js";

export const createListing = async (data) => {
    return await VendorProduct.create(data);
};

export const findListingsByVendor = async (vendorId) => {
    return await VendorProduct.find({ vendorId })
        .populate({
            path: 'productId',
            select: 'name slug thumbnail images hsnCode gstPercentage categoryId brandId',
            populate: [
                { path: 'brandId', select: 'name' },
                { path: 'categoryId', select: 'name' }
            ]
        })
        .sort({ createdAt: -1 });
};

export const findListingByIdAndVendor = async (id, vendorId) => {
    return await VendorProduct.findOne({ _id: id, vendorId })
        .populate('productId')
        .populate('warehouseId');
};

export const getDistinctProductIds = async (query = {}) => {
    return await VendorProduct.distinct("productId", query);
};

// Powerful search for Buyers OR Vendors to filter by Master Product traits
export const findAllListings = async (query = {}) => {
    return await VendorProduct.find(query)
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
        { _id: id, vendorId },
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate('productId');
};

export const removeListing = async (id, vendorId) => {
    return await VendorProduct.findOneAndDelete({ _id: id, vendorId });
};
