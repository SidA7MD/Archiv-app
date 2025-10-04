import mongoose from "mongoose";

let bucket;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    // No need for useNewUrlParser and useUnifiedTopology in newer versions

    // Initialize GridFSBucket
    bucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: "pdfs"
    });

    console.log("MongoDB connected with GridFSBucket");
  } catch (err) {
    console.error("DB Connection Error:", err.message);
    process.exit(1);
  }
};

export { bucket };