import dotenv from 'dotenv';
dotenv.config();

export const dbConfig = {
    uri: process.env.MONGODB_URI,
    options: {
        // Add any specific mongoose options here
    }
};
