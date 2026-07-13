import ApiError from "../../utils/ApiError.js";
import {
    deleteProfile_repository,
    displayProfile_repository,
    editProfile_repository,
    findActiveUserById_repository,
    findUserByEmailExcludingId_repository,
    findUserByMobileExcludingId_repository,
} from "./customerProfile.repository.js";

const formatProfile = (user) => ({
    name: user.fullName,
    photo: user.photo || "",
    email: user.email || "",
    mobile: user.mobile || "",
});

export const displayProfile_Services = async (userId) => {
    const userDetails = await displayProfile_repository(userId);
    if (!userDetails) {
        throw new ApiError(404, "Profile not found");
    }
    return formatProfile(userDetails);
};

export const editProfile_Services = async (userId, data) => {
    const user = await findActiveUserById_repository(userId);
    if (!user) {
        throw new ApiError(404, "Profile not found");
    }

    const updateData = {};

    const name = data.name ?? data.fullName;
    if (name !== undefined) {
        const trimmedName = String(name).trim();
        if (!trimmedName) {
            throw new ApiError(400, "Name cannot be empty");
        }
        updateData.fullName = trimmedName;
    }

    if (data.email !== undefined) {
        const email = String(data.email).trim().toLowerCase();
        if (!email) {
            throw new ApiError(400, "Email cannot be empty");
        }
        const emailExists = await findUserByEmailExcludingId_repository(
            email,
            userId
        );
        if (emailExists) {
            throw new ApiError(400, "Email already in use");
        }
        updateData.email = email;
    }

    const mobile = data.mobile ?? data.phone ?? data.phoneNo;
    if (mobile !== undefined) {
        const trimmedMobile = String(mobile).trim();
        if (!trimmedMobile) {
            throw new ApiError(400, "Mobile number cannot be empty");
        }
        const mobileExists = await findUserByMobileExcludingId_repository(
            trimmedMobile,
            userId
        );
        if (mobileExists) {
            throw new ApiError(400, "Mobile number already in use");
        }
        updateData.mobile = trimmedMobile;
    }

    if (data.photo !== undefined) {
        updateData.photo = data.photo;
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No fields provided to update");
    }

    const updatedUser = await editProfile_repository(userId, updateData);
    if (!updatedUser) {
        throw new ApiError(404, "Profile not found");
    }

    return formatProfile(updatedUser);
};

export const deleteProfile_Services = async (userId) => {
    const deletedUser = await deleteProfile_repository(userId);
    if (!deletedUser) {
        throw new ApiError(404, "Profile not found");
    }
    return true;
};
