import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { bucket } from "../config/db.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 16 * 1024 * 1024 // 16MB limit
  }
});

// Upload PDF - Fixed version
router.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file required" });
    }

    const { semester, type, subject, year } = req.body;
    if (!semester || !type || !subject || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!bucket) {
      return res.status(500).json({ message: "Database not connected" });
    }

    // Create a promise to handle the upload
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: "application/pdf",
        metadata: { 
          semester, 
          type, 
          subject, 
          year, 
          uploadedAt: new Date() 
        },
      });

      // Store the file ID when the stream is created
      const fileId = uploadStream.id;

      uploadStream.end(req.file.buffer);

      uploadStream.on("finish", () => {
        resolve(fileId);
      });

      uploadStream.on("error", (err) => {
        reject(err);
      });
    });

    // Wait for the upload to complete
    const fileId = await uploadPromise;
    
    res.status(201).json({ 
      message: "PDF uploaded successfully", 
      fileId: fileId,
      filename: req.file.originalname
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// Alternative simpler approach
router.post("/upload-simple", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file required" });
    }

    const { semester, type, subject, year } = req.body;
    if (!semester || !type || !subject || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!bucket) {
      return res.status(500).json({ message: "Database not connected" });
    }

    // Get the file ID before starting the upload
    const fileId = new mongoose.Types.ObjectId();
    
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      _id: fileId, // Set the ID explicitly
      contentType: "application/pdf",
      metadata: { 
        semester, 
        type, 
        subject, 
        year, 
        uploadedAt: new Date() 
      },
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      res.status(201).json({ 
        message: "PDF uploaded successfully", 
        fileId: fileId,
        filename: req.file.originalname
      });
    });

    uploadStream.on("error", (err) => {
      console.error("GridFS upload error:", err);
      res.status(500).json({ message: "Upload failed", error: err.message });
    });

  } catch (err) {
    console.error("Route error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// Download PDF by ID
router.get("/download/:id", async (req, res) => {
  try {
    if (!bucket) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "PDF not found" });
    }

    const file = files[0];
    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", `inline; filename="${file.filename}"`);

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);

    downloadStream.on("error", (err) => {
      console.error("Download error:", err);
      res.status(500).json({ message: "Download failed", error: err.message });
    });

  } catch (err) {
    console.error("Route error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// Get all PDFs
router.get("/files", async (req, res) => {
  try {
    if (!bucket) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const files = await bucket.find().toArray();
    res.json(files);
  } catch (err) {
    console.error("Route error:", err);
    res.status(500).json({ message: "Error fetching files", error: err.message });
  }
});

export default router;