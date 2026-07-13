import ApiError from "../../utils/ApiError.js";
import {
    addAddress_Repository,
    countActiveAddresses_Repository,
    deleteAddress_Repository,
    displayAddressFullDetails_repository,
    displayAllAddress_repository,
    editAddress_Repository,
    findAddressById_Repository,
} from "./address.repository.js";

const formatAddress = (addr) => ({
    addressId: addr._id,
    siteId: addr.siteId?._id ?? addr.siteId ?? null,
    siteName: addr.siteId?.siteName ?? null,
    fullName: addr.fullName,
    mobileNo: addr.mobileNo,
    address: addr.address,
    landmark: addr.landmark,
    city: addr.city,
    state: addr.state,
    pinCode: addr.pinCode,
    addressType: addr.addressType,
    isSelect: addr.isSelect ?? false,
});

export const DisplayAddressFullDetails_Services = async (userId, addressId) => {
    console.log(userId, addressId, "userId, addressId");
    const addressFullDetails = await displayAddressFullDetails_repository(
        userId,
        addressId
    );
    console.log(addressFullDetails, "addressFullDetails");
    return addressFullDetails ? formatAddress(addressFullDetails) : null;
};

export const DisplayAllAddressDetails_Services = async (userID) => {
    const displayAllAddress = await displayAllAddress_repository(userID);

    if (!displayAllAddress?.length) {
        return [];
    }

    console.log(displayAllAddress, "displayAllAddress");
    return displayAllAddress.map(formatAddress);
};

export const addAddress_Services = async (userId, data) => {
    const existingCount = await countActiveAddresses_Repository(userId);

    const address = {
        siteId: data.siteId,
        fullName: data.fullName,
        mobileNo: data.mobileNo,
        address: data.address ?? data.Address,
        landmark: data.landmark,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        addressType: data.addressType,
        isSelect: existingCount === 0,
    };

    const result = await addAddress_Repository(userId, address);
    console.log(result, "result");
    if (!result) {
        throw new ApiError(404, "Address could not be created.");
    }

    return result;
};

export const editAddress_Services = async (userId, addressId, data) => {
    const updated = await editAddress_Repository(userId, addressId, {
        siteId: data.siteId,
        fullName: data.fullName,
        mobileNo: data.mobileNo,
        address: data.address ?? data.Address,
        landmark: data.landmark,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        addressType: data.addressType,
    });

    if (!updated) {
        throw new ApiError(404, "Address not found.");
    }

    return formatAddress(updated);
};

export const deleteAddress_Services = async (userId, addressId) => {
    console.log(":S", userId, addressId);

    const address = await findAddressById_Repository(userId, addressId);
    if (!address) {
        throw new ApiError(404, "Address not found.");
    }

    if (address.isSelect) {
        throw new ApiError(400, "Selected address cannot be deleted.");
    }

    return await deleteAddress_Repository(userId, addressId);
};
