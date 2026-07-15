import addressModel from "./address.model.js";
import siteModel from "../site/site.model.js";

const notDeleted = { isDelete: { $ne: true } };

export const displayAddressFullDetails_repository = async (
    userId,
    addressId
) => {
    const address = await addressModel
        .findOne({
            _id: addressId,
            userId,
            ...notDeleted,
        })
        .populate("siteId", "siteName");

    return address;
};

export const displayAllAddress_repository = async ({
    userId,
    skip = 0,
    limit = 10,
    search = "",
}) => {
    const filter = { userId, ...notDeleted };

    if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = { $regex: escaped, $options: "i" };

        const matchingSites = await siteModel.find(
            { siteName: regex, ...notDeleted },
            { _id: 1 }
        );
        const siteIds = matchingSites.map((s) => s._id);

        filter.$or = [
            { fullName: regex },
            { mobileNo: regex },
            { landmark: regex },
            { city: regex },
            { addressType: regex },
            {
                $expr: {
                    $regexMatch: {
                        input: { $toString: { $ifNull: ["$pinCode", ""] } },
                        regex: escaped,
                        options: "i",
                    },
                },
            },
        ];

        if (siteIds.length) {
            filter.$or.push({ siteId: { $in: siteIds } });
        }
    }

    const [addresses, total] = await Promise.all([
        addressModel
            .find(filter)
            .populate("siteId", "siteName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        addressModel.countDocuments(filter),
    ]);

    return { addresses, total };
};

export const countActiveAddresses_Repository = async (userId) => {
    return await addressModel.countDocuments({ userId, ...notDeleted });
};

export const findAddressById_Repository = async (userId, addressId) => {
    return await addressModel.findOne({
        _id: addressId,
        userId,
        ...notDeleted,
    });
};

export const addAddress_Repository = async (userId, address) => {
    const data = await addressModel.create({
        userId,
        ...address,
    });

    return data;
};

export const editAddress_Repository = async (userId, addressId, body) => {
    const $set = {};

    if (body.siteId !== undefined) $set.siteId = body.siteId;
    if (body.fullName !== undefined) $set.fullName = body.fullName;
    if (body.mobileNo !== undefined) $set.mobileNo = body.mobileNo;
    if (body.address !== undefined) $set.address = body.address;
    if (body.landmark !== undefined) $set.landmark = body.landmark;
    if (body.city !== undefined) $set.city = body.city;
    if (body.state !== undefined) $set.state = body.state;
    if (body.pinCode !== undefined) $set.pinCode = body.pinCode;
    if (body.addressType !== undefined) $set.addressType = body.addressType;

    const updatedAddress = await addressModel
        .findOneAndUpdate(
            {
                _id: addressId,
                userId,
                ...notDeleted,
            },
            { $set },
            {
                new: true,
                runValidators: true,
            }
        )
        .populate("siteId", "siteName");

    return updatedAddress;
};

export const deleteAddress_Repository = async (userId, addressId) => {
    const deletedAddress = await addressModel.findOneAndUpdate(
        {
            _id: addressId,
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

    return deletedAddress;
};
