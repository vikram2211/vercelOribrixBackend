import connectDB from './connection.js';
import { seedRoles, seedAdmin } from './seed.js';

const runSeed = async () => {
    try {
        await connectDB();
        console.log("Connected to database for seeding...");

        await seedRoles();
        await seedAdmin();
        console.log("Roles and Admin seeded successfully!");

        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

runSeed();
