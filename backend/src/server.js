import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


const corsOptions = {
  origin: [
    "https://www.larchive.tech",
    "https://larchive.tech",
    "http://localhost:3000",
    "http://localhost:5173" // Vite dev server
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};


app.use(cors(corsOptions));

app.use("/api/pdfs", pdfRoutes);




connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
