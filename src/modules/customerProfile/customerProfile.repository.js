import CustomerProfile from "./customerProfile.model.js"
import User from "../user/user.model.js"

export const displayProfile_repository = async(userId) =>{
    console.log("----")
const userDetails = await User.findById(userId);
console.log(userDetails,"userDetails")
return userDetails;
}


// site ===============================

export const displaySiteFullDetails_repository = async(userId,siteId) => {
    console.log(userId,siteId,"userId,siteId")
const profile = await CustomerProfile.findOne({userId : userId});
// console.log(profile,"profile")
if(!profile){return null};
console.log(profile.sites,"123")
const site = profile.sites.id(siteId);
if(!site){
    return null;
}
return site;
}

export const displayAllSite_repository = async(userId) =>{
console.log(userId,"userID");
const data = await CustomerProfile.findOne({userId:userId});
console.log(data,"data");
return data;
}

export const addSite_Repository = async (userId, site) => {
    console.log(userId, site,"-----")
    const data =  await CustomerProfile.findOneAndUpdate(
        { userId },
        {
            $push: {
                sites: site,
            },
        },
        {
            new: true,
        }
    );
    console.log(data,"@@")
    return data;
};

export const editSite_Repository = async (userId, siteId, body) => {
  const profile = await CustomerProfile.findOneAndUpdate(
    {
      userId,
      "sites._id": siteId,
    },
    {
      $set: {
        "sites.$.siteName": body.siteName,
        "sites.$.siteAddress": body.siteAddress,
        "sites.$.pincode": body.pincode,
        "sites.$.members": body.members,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!profile) return null;

  const updatedSite = profile.sites.id(siteId);

  return updatedSite;
};
export const deleteSite_Repository = async (userId, siteId) => {
    console.log(userId, siteId,"=====")
    const profile = await CustomerProfile.findOneAndUpdate(
        { userId },
        {
            $pull: {
                sites: {
                    _id: siteId,
                },
            },
        },
        {
            returnDocument: "after",
        }
    );
console.log(profile,"profile")
    return profile;
};