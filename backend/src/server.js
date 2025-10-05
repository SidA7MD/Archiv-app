import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;


const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://www.larchive.tech",
      "https://larchive.tech",
      "http://localhost:3000",
      "http://localhost:5173",
    ];
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};


app.use(cors(corsOptions));
app.use(express.json());



app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});


app.use("/api/pdfs", pdfRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log('CORS enabled for methods:', corsOptions.methods);
  });
}).catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});