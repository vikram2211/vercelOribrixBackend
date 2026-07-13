import User from "../user/user.model.js";
import Session from "../session/session.model.js";

export const displayProfile_repository = async (userId) => {
    const userDetails = await User.findOne({
        _id: userId,
        isActive: true,
    });
    return userDetails;
};

export const findActiveUserById_repository = async (userId) => {
    return await User.findOne({ _id: userId, isActive: true });
};

export const findUserByEmailExcludingId_repository = async (email, userId) => {
    return await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId },
        isActive: true,
    });
};

export const findUserByMobileExcludingId_repository = async (mobile, userId) => {
    return await User.findOne({
        mobile,
        _id: { $ne: userId },
        isActive: true,
    });
};

export const editProfile_repository = async (userId, updateData) => {
    return await User.findOneAndUpdate(
        { _id: userId, isActive: true },
        { $set: updateData },
        { new: true, runValidators: true }
    );
};

export const deleteProfile_repository = async (userId) => {
    const deletedUser = await User.findOneAndUpdate(
        { _id: userId, isActive: true },
        { $set: { isActive: false } },
        { new: true }
    );

    if (deletedUser) {
        await Session.deleteMany({ userId });
    }

    return deletedUser;
};
