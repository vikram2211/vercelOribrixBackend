import siteModel from "./site.model.js";

const notDeleted = { isDelete: { $ne: true } };

export const displaySiteFullDetails_repository = async (userId, siteId) => {
    const site = await siteModel.findOne({
        _id: siteId,
        userId,
        ...notDeleted,
    });

    return site;
};

export const displayAllSite_repository = async ({
    userId,
    skip = 0,
    limit = 10,
    search = "",
}) => {
    const filter = { userId, ...notDeleted };

    if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = { $regex: escaped, $options: "i" };
        filter.$or = [{ siteName: regex }, { pinCode: regex }];
    }

    const [sites, total] = await Promise.all([
        siteModel
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        siteModel.countDocuments(filter),
    ]);

    return { sites, total };
};

export const addSite_Repository = async (userId, site) => {
    const data = await siteModel.create({
        userId,
        ...site,
    });

    return data;
};

export const editSite_Repository = async (userId, siteId, body) => {
    const updatedSite = await siteModel.findOneAndUpdate(
        {
            _id: siteId,
            userId,
            ...notDeleted,
        },
        {
            $set: {
                siteName: body.siteName,
                siteAddress: body.siteAddress,
                pinCode: body.pinCode ?? body.pincode,
                members: body.members,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );

    return updatedSite;
};

export const deleteSite_Repository = async (userId, siteId) => {
    const deletedSite = await siteModel.findOneAndUpdate(
        {
            _id: siteId,
            userId,
            ...notDeleted,
        },
        {
            $set: { isDelete: true },
        },
        {
            new: true,
        }
    );

    return deletedSite;
};

export const displaySiteName_Repository = async (userId) => {
    const sites = await siteModel.find(
        { userId, ...notDeleted },
        {
            _id: 1,
            siteName: 1,
        }
    );

    return sites;
};
