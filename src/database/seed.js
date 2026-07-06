import Role from "../modules/role/role.model.js";
import User from "../modules/user/user.model.js";
import bcrypt from "bcryptjs";

export const seedRoles = async () => {
    const roles = [
        "SUPER_ADMIN",
        "ADMIN",
        "CUSTOMER",
        "TEAM_MEMBER",
        "VENDOR_OWNER",
        "VENDOR_MANAGER",
        "DRIVER"
    ];

    for (const roleName of roles) {
        const exists = await Role.findOne({ name: roleName });

        if (!exists) {
            await Role.create({ name: roleName });
        }
    }
};

export const seedAdmin = async () => {
    const adminRole = await Role.findOne({ name: "SUPER_ADMIN" });
    if (!adminRole) return;

    const adminEmail = "admin@oribrix.com";
    const exists = await User.findOne({ email: adminEmail });

    if (!exists) {
        const hashedPassword = await bcrypt.hash("Admin@123", 10);
        await User.create({
            fullName: "System Admin",
            email: adminEmail,
            password: hashedPassword,
            role: adminRole._id,
            isVerified: true,
            is2FAEnabled: true, // As per UI
            twoFactorSecret: "MOCK_SECRET_123" // Placeholder for now
        });
        console.log("Admin account seeded successfully (admin@oribrix.com / Admin@123)");
    }
};