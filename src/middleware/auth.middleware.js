import { verifyAccessToken } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";

/**
 * Protects routes that require a valid JWT access token.
 * Attaches decoded user payload to req.user = { userId, role }.
 */
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Access denied. No token provided.");
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyAccessToken(token);

        // Attach to request so downstream handlers can use it
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return next(new ApiError(401, "Token has expired. Please log in again."));
        }
        if (err.name === "JsonWebTokenError") {
            return next(new ApiError(401, "Invalid token."));
        }
        next(err);
    }
};

/**
 * Restricts a route to one or more specific roles.
 * Must be used AFTER the authenticate middleware.
 *
 * Accepts role strings, arrays of roles, or a permission group object
 * (e.g. AdminPermissions), which is expanded to all of its role values.
 *
 * Usage:
 *   authorize("ADMIN", "CUSTOMER")     // specific roles
 *   authorize(AdminPermissions)         // ADMIN + SUB_ADMIN
 *   authorize(AdminPermissions.ADMIN)   // ADMIN only
 */
export const authorize = (...roles) => {
    const allowedRoles = roles.flatMap((role) => {
        if (Array.isArray(role)) return role;
        if (role && typeof role === "object") return Object.values(role);
        return role;
    });

    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return next(new ApiError(403, "Access denied. Insufficient permissions."));
        }
        next();
    };
};
