import mongoose from 'mongoose';
import { dbConfig } from '../config/db.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(dbConfig.uri, dbConfig.options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
