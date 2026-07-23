import connectDB from './connection.js';
import { seedRoles, seedAdmin, seedPermissions } from './seed.js';

const runSeed = async () => {
    try {
        await connectDB();
        console.log("Connected to database for seeding...");

        await seedRoles();
        await seedAdmin();
        await seedPermissions();
        console.log("Roles, Admin and Permissions seeded successfully!");

        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

runSeed();
