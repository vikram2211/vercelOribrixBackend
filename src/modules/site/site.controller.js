import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import pagination from "../../utils/pagination.js";
import { addSite_Services, deleteSite_Services, DisplayAllSiteDetails_Services, DisplaySiteFullDetails_Services, displaySiteName_Services, editSite_Services } from "./site.service.js";

export const displaySites = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    let siteData;

    if (req.query.siteId) {
        siteData = await DisplaySiteFullDetails_Services(
            userId,
            req.query.siteId
        );
    } else {
        const { page, limit, skip } = pagination(req.query);
        const search = req.query.search || req.query.siteName || req.query.pincode || "";

        siteData = await DisplayAllSiteDetails_Services({
            userId,
            page,
            limit,
            skip,
            search,
        });
    }

    return sendResponse(
        res,
        200,
        "Site details fetched successfully",
        siteData
    );
});

export const addSites = asyncHandler(async (req, res) => {
    const userID = req.user.userId;
    const data = req.body;
    const siteDetails = await addSite_Services(userID, data);
    return sendResponse(res, 200, "Site added successfully", null);
})

export const editSites = asyncHandler(async (req, res) => {
    const userID = req.user.userId;
    const { id } = req.params;
    const data = req.body;
    const siteDetails = await editSite_Services(userID, id, data);
    return sendResponse(res, 200, "Site edit successfully", siteDetails);
})

export const deleteSites = asyncHandler(async (req, res) => {
    const userID = req.user.userId;
    console.log(userID, "userID");
    const { id } = req.params;
    const siteDetails = await deleteSite_Services(userID, id);
    return sendResponse(res, 200, "site deleted successfully", siteDetails);
})

export const displaySiteName = asyncHandler(async (req, res) => {
    const userID = req.user.userId;
    const siteNames = await displaySiteName_Services(userID);
    return sendResponse(res, 200, "Display site name successfully", siteNames);
});

