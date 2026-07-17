import * as homeRepo from "./home.repository.js";

export const getMobileHomeData = async (userId) => {
    // 1. Fetch primary site address
    const site = await homeRepo.findFirstSiteByUserId(userId);
    let siteAddress = null;
    if (site) {
        siteAddress = {
            siteId: site._id,
            siteName: site.siteName,
            siteAddress: site.siteAddress,
            pinCode: site.pinCode
        };
    }

    // 2. Mock latest order
    const latestOrder = {
        orderId: "ORD-DUMMY-001",
        status: "ON_THE_WAY",
        driverName: "Ram Singh"
    };

    // Static banner configuration
    const banner = {
        title: "Bulk Saver - 18% off",
        description: "Request a quote for BOQ > Rs 1L"
    };

    // 3. Top categories
    const categoryDocs = await homeRepo.findTopCategories(6);
    const categories = categoryDocs.map(c => ({
        categoryId: c._id,
        name: c.name,
        image: c.image
    }));

    // 4. Trending vendor product (Single object)
    const vendorProductsDocs = await homeRepo.findTrendingVendorProducts(1); // Get top 1
    const validTrendingProducts = vendorProductsDocs
        .filter(vp => vp.productId)
        .map(vp => ({
            vendorProductId: vp._id,
            productId: vp.productId._id,
            name: vp.productId.name,
            image: vp.productId.thumbnail || (vp.productId.images && vp.productId.images.length > 0 ? vp.productId.images[0] : ""),
            sellingPrice: vp.sellingPrice
        }));

    // Pick the first one or assign null if none exists
    const trending = validTrendingProducts.length > 0 ? validTrendingProducts[0] : null;

    // 5. Recently bought dummy list
    const productDocs = await homeRepo.findRecentProducts(5);
    const recentlyBought = productDocs.map(p => ({
        productId: p._id,
        name: p.name
    }));

    return {
        siteAddress,
        latestOrder,
        banner,
        categories,
        trending,
        recentlyBought
    };
};
