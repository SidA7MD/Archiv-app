import mongoose from "mongoose";
import Grid from "gridfs-stream";

export let gfs; 

export const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  gfs = Grid(conn.connection.db, mongoose.mongo);
  gfs.collection("pdfs"); 

  console.log("MongoDB connected with GridFS");
};
