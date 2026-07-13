import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import { addSite_Services, deleteSite_Services, DisplayAllSiteDetails_Services, displayProfile_Services, DisplaySiteFullDetails_Services, editSite_Services } from "./customerProfile.service.js";

export const displayProfileDetails = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    console.log(userId, "userId");

    const userDetails = await displayProfile_Services(userId);
    console.log(userDetails, "userDetails");
    if (!userDetails) {
        return sendError(res, 404, "Profile not found");
    }
    const customerDetails = {

        name: userDetails.fullName,
        photo: "",
        email: userDetails.email,
        mobile: userDetails.mobile

    }

    return sendResponse(
        res,
        200,
        "Profile details fetched successfully",
        customerDetails
    );
});

export const editProfileDetails = asyncHandler(async (req, res) => {
})

export const deleteProfileDetails = asyncHandler(async (req, res) => {
})

// sites ==================================

export const displaySites = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    let siteData;

    if (req.query.siteId) {
        console.log(req.query.siteId,"====")
        siteData = await DisplaySiteFullDetails_Services(
            userId,
            req.query.siteId
        );
    } else {
        siteData = await DisplayAllSiteDetails_Services(userId);
    }
console.log(siteData,"siteData==")
    return sendResponse(
        res,
        200,
        "Site details fetched successfully",
        siteData
    );
});

export const addSites = asyncHandler(async(req, res) =>{
const userID = req.user.userId;
const data = req.body;
const siteDetails = await addSite_Services(userID , data);
return sendResponse(res, 200, "Site added successfully" ,null);
})

export const editSites = asyncHandler(async(req, res) =>{
const userID = req.user.userId;
const {id} = req.params;
const data = req.body;
const siteDetails = await editSite_Services(userID,id ,data);
return sendResponse(res, 200, "Site edit successfully" ,siteDetails);
})

export const deleteSites = asyncHandler(async(req, res) =>{
    const userID = req.user.userId;
    console.log(userID,"userID");
    const {id} = req.params;
    const siteDetails = await deleteSite_Services(userID,id);
return sendResponse(res, 200, "site deleted successfully" ,siteDetails);
})