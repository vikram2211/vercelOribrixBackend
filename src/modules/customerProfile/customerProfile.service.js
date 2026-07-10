import { displayProfile_repository } from "./customerProfile.repository.js";

export const displayProfile_Services = async (userID) => {
    console.log("======")
    const userDetails = await displayProfile_repository(userID);
    console.log(userDetails,"userDetails===1")
    return userDetails;
}

