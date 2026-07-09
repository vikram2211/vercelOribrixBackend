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
 * Usage: authorize("ADMIN", "CUSTOMER")
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ApiError(403, "Access denied. Insufficient permissions."));
        }
        next();
    };
};
