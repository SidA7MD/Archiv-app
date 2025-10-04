import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let bucket;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Initialize GridFS bucket with explicit name
    bucket = new GridFSBucket(conn.connection.db, {
      bucketName: "fs" // This MUST match what you used when uploading
    });

    console.log("GridFS bucket initialized");

    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export { bucket };