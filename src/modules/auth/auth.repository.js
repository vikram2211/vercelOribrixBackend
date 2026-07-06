import User from "../user/user.model.js";
import Role from "../role/role.model.js";
import Session from "../session/session.model.js";

export const findUserByEmail = async (email) => {
    return await User.findOne({ email }).populate("role");
};

export const findUserByMobile = async (mobile) => {
    return await User.findOne({ mobile }).populate("role");
};

export const findRoleByName = async (roleName) => {
    return await Role.findOne({ name: roleName });
};

export const createUser = async (userData) => {
    return await User.create(userData);
};

export const createSession = async (sessionData) => {
    return await Session.create(sessionData);
};

export const findSessionByToken = async (refreshToken) => {
    return await Session.findOne({ refreshToken });
};

export const deleteSession = async (refreshToken) => {
    return await Session.deleteOne({ refreshToken });
};