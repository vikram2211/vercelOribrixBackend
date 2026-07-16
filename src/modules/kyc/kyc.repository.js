    import Vendor from "../vendor/vendor.model.js";

const DOC_KEYS = [
    "gstCert",
    "panCard",
    "cancelledCheque",
    "msmeUdyam",
    "shopAndTradeLicense",
    "ownerAadhaarDoc",
    "oribrixSellerAgreement",
    "iso9001",
];

const buildDocumentStatusStages = () => [
    {
        $addFields: {
            docStatuses: DOC_KEYS.map((key) => ({
                $ifNull: [`$kycDocuments.${key}.status`, "PENDING"],
            })),
        },
    },
    {
        $addFields: {
            documentStatus: {
                $switch: {
                    branches: [
                        {
                            case: {
                                $eq: [
                                    {
                                        $size: {
                                            $filter: {
                                                input: "$docStatuses",
                                                as: "s",
                                                cond: {
                                                    $ne: ["$$s", "APPROVED"],
                                                },
                                            },
                                        },
                                    },
                                    0,
                                ],
                            },
                            then: "approved",
                        },
                        {
                            case: {
                                $eq: [
                                    {
                                        $size: {
                                            $filter: {
                                                input: "$docStatuses",
                                                as: "s",
                                                cond: {
                                                    $ne: ["$$s", "REJECTED"],
                                                },
                                            },
                                        },
                                    },
                                    0,
                                ],
                            },
                            then: "rejected",
                        },
                        {
                            case: {
                                $eq: [
                                    {
                                        $size: {
                                            $filter: {
                                                input: "$docStatuses",
                                                as: "s",
                                                cond: {
                                                    $ne: ["$$s", "PENDING"],
                                                },
                                            },
                                        },
                                    },
                                    0,
                                ],
                            },
                            then: "pending",
                        },
                    ],
                    default: "underReview",
                },
            },
        },
    },
];

export const findVendorsKYCPaginated_Repository = async ({
    skip,
    limit,
    search,
    status,
}) => {
    const match = {};

    if (search) {
        match.$or = [
            { "ownerDetails.fullName": { $regex: search, $options: "i" } },
            { "ownerDetails.email": { $regex: search, $options: "i" } },
            { "ownerDetails.mobile": { $regex: search, $options: "i" } },
        ];
    }

    const pipeline = [
        { $match: match },
        ...buildDocumentStatusStages(),
        // Fully approved KYC vendors are excluded from the list
        { $match: { documentStatus: { $ne: "approved" } } },
    ];

    if (status) {
        pipeline.push({ $match: { documentStatus: status } });
    }

    pipeline.push({
        $facet: {
            vendors: [
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        _id: 1,
                        ownerDetails: 1,
                        kycDocuments: 1,
                        documentStatus: 1,
                        createdAt: 1,
                    },
                },
            ],
            totalCount: [{ $count: "count" }],
        },
    });

    const [result] = await Vendor.aggregate(pipeline);
    const vendors = result?.vendors || [];
    const total = result?.totalCount?.[0]?.count || 0;

    return { vendors, total };
};

export const findVendorKYCById_Repository = async (vendorId) => {
    return await Vendor.findById(vendorId)
        .populate("productCategories", "name")
        .lean();
};

export const updateVendorKYCDocuments_Repository = async (
    vendorId,
    updateData
) => {
    return await Vendor.findByIdAndUpdate(
        vendorId,
        { $set: updateData },
        { new: true, runValidators: true }
    )
        .populate("productCategories", "name")
        .lean();
};