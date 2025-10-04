import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import pdfRoutes from "./routes/pdfRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/pdfs", pdfRoutes);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
