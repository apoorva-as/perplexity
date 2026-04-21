import mongoose from "mongoose";
import userModel from "../models/user.model.js";

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Cleanup old indexes left from the previous email-based auth schema.
    try {
        await userModel.collection.dropIndex("email_1");
        console.log("Dropped stale index: users.email_1");
    } catch (error) {
        const ignorable = error?.codeName === "IndexNotFound" || error?.codeName === "NamespaceNotFound";
        if (!ignorable) {
            throw error;
        }
    }

    await userModel.syncIndexes();
};

export default connectDB;