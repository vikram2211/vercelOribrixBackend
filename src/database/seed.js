import Role from "../modules/role/role.model.js";
import User from "../modules/user/user.model.js";
import Permission, {
    DEFAULT_PERMISSIONS,
} from "../modules/admin/permissions.model.js";
import bcrypt from "bcryptjs";

export const seedPermissions = async () => {
    for (const permission of DEFAULT_PERMISSIONS) {
        await Permission.updateOne(
            { key: permission.key },
            { $set: { ...permission, isActive: true } },
            { upsert: true }
        );
    }
    console.log(`Permissions seeded (${DEFAULT_PERMISSIONS.length} modules)`);
};

export const seedRoles = async () => {
    const roles = [
        "SUPER_ADMIN",
        "ADMIN",
        "SUB_ADMIN",
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
    const adminRole = await Role.findOne({ name: "ADMIN" });
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