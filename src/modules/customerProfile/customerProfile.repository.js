import User from "../user/user.model.js"

export const displayProfile_repository = async (userId) => {
    console.log("----")
    const userDetails = await User.findById(userId);
    console.log(userDetails, "userDetails")
    return userDetails;
}
