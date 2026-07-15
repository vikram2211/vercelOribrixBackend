import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import pagination from "../../utils/pagination.js";
import { addAddress_Services, deleteAddress_Services, DisplayAddressFullDetails_Services, DisplayAllAddressDetails_Services, editAddress_Services } from "./address.service.js";

export const displayAddress = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    let addressData;

    if (req.query.addressId) {
        addressData = await DisplayAddressFullDetails_Services(
            userId,
            req.query.addressId
        );
    } else {
        const { page, limit, skip } = pagination(req.query);
        const search = req.query.search || "";

        addressData = await DisplayAllAddressDetails_Services({
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
        "address details fetched successfully",
        addressData
    );
});
export const addAddress = asyncHandler(async (req, res) =>{
    const userID = req.user.userId;
const data = req.body;
const addressDetails = await addAddress_Services(userID , data);
return sendResponse(res, 200, "Address added successfully" ,null);
})
export const editAddress = asyncHandler(async (req, res) => {
    const userID = req.user.userId;
    const { id } = req.params;
    const data = req.body;
    const addressDetails = await editAddress_Services(userID, id, data);
    return sendResponse(res, 200, "Address edit successfully", addressDetails);
});
export const deleteAddress = asyncHandler(async (req, res) =>{
     const userID = req.user.userId;
    console.log(userID,"userID");
    const {id} = req.params;
    const addressDetails = await deleteAddress_Services(userID,id);
return sendResponse(res, 200, "Address deleted successfully" ,addressDetails);
})