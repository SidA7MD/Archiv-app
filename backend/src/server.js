import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", "https://larchive.teck"], // allowed origins
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use("/api/pdfs", pdfRoutes);




connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
