import { addSite_Repository, deleteSite_Repository, displayAllSite_repository, displaySiteFullDetails_repository, displaySiteName_Repository, editSite_Repository } from "./site.repository.js";
import ApiError from "../../utils/ApiError.js";

export const DisplaySiteFullDetails_Services = async (userId, siteId) => {
    console.log(userId, siteId, "userId, siteId")
    const sitesFullDetails = displaySiteFullDetails_repository(userId, siteId);
    console.log(sitesFullDetails, "sitesFullDetails");
    return sitesFullDetails;
}

export const DisplayAllSiteDetails_Services = async (userID) => {
    const displayAllSite = await displayAllSite_repository(userID);

    if (!displayAllSite) {
        return null;
    }

    return displayAllSite.sites.map((site) => ({
        siteId: site._id,
        siteName: site.siteName,
        siteAddress: site.siteAddress,
        pincode: site.pincode,
        members: site.members.length,
    }));
};


export const addSite_Services = async (userId, data) => {
    const members =
        data.members?.map((name) => ({
            name,
        })) || [];

    const site = {
        siteName: data.siteName,
        siteAddress: data.siteAddress,
        pinCode: data.pinCode,
        members,
    };

    const result = await addSite_Repository(userId, site);
    console.log(result, "result")
    if (!result) {
        throw new ApiError(404, "Customer profile not found.");
    }

    return result;
};
export const editSite_Services = async (userId, siteId, data) => {
    return await editSite_Repository(userId, siteId, data);
}

export const deleteSite_Services = async (siteId) => {
    console.log(":S",siteId);
    const profile = await deleteSite_Repository( siteId);
    return profile;
}

export const displaySiteName_Services = async (userID) => {
    const siteName = await displaySiteName_Repository(userId);
    return siteName;
}