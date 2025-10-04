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

// Upload PDF
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!bucket) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const { semester, type, subject, year } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    if (!semester || !type || !subject || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      metadata: { semester, type, subject, year },
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      res.status(201).json({
        message: "PDF uploaded successfully",
        fileId: uploadStream.id,
        filename: req.file.originalname,
      });
    });

    uploadStream.on("error", (err) => {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Upload failed", error: err.message });
    });
  } catch (err) {
    console.error("Route error:", err);
    res.status(500).json({ message: "Something went wrong!", error: err.message });
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
      if (!res.headersSent) {
        res.status(500).json({ message: "Download failed", error: err.message });
      }
    });

  } catch (err) {
    console.error("Route error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// Rename PDF by ID - FIXED
// Rename PDF by ID - SIMPLIFIED VERSION THAT WORKS
router.put("/rename/:id", async (req, res) => {
  try {
    console.log("=== RENAME REQUEST ===");
    console.log("File ID:", req.params.id);
    console.log("New Name:", req.body.newName);

    if (!bucket) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const { newName } = req.body;

    if (!newName || newName.trim() === "") {
      return res.status(400).json({ message: "New filename is required" });
    }

    let fileId;
    try {
      fileId = new mongoose.Types.ObjectId(req.params.id);
    } catch (err) {
      return res.status(400).json({ message: "Invalid file ID format" });
    }

    // Check if file exists first
    const files = await bucket.find({ _id: fileId }).toArray();
    console.log("File found:", files.length > 0);
    
    if (files.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    console.log("Current filename:", files[0].filename);
    console.log("Bucket name:", bucket.s.name || bucket.bucketName || "fs");

    // Get the actual collection name from the bucket
    const bucketName = bucket.s.name || bucket.bucketName || "fs";
    const collectionName = `${bucketName}.files`;
    
    console.log("Updating collection:", collectionName);

    // Update using the bucket's database connection
    const result = await bucket.s.db.collection(collectionName).updateOne(
      { _id: fileId },
      { $set: { filename: newName.trim() } }
    );

    console.log("Update result:", {
      matched: result.matchedCount,
      modified: result.modifiedCount
    });

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        message: "Could not update file. Check backend logs for details." 
      });
    }

    res.json({ 
      message: "File renamed successfully", 
      fileId: fileId.toString(), 
      newName: newName.trim(),
      modified: result.modifiedCount > 0
    });

  } catch (err) {
    console.error("Rename error:", err);
    res.status(500).json({ message: "Rename failed", error: err.message });
  }
});

// Delete PDF by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    console.log("=== DELETE REQUEST ===");
    console.log("File ID:", req.params.id);

    if (!bucket) {
      return res.status(500).json({ message: "Database not connected" });
    }

    let fileId;
    try {
      fileId = new mongoose.Types.ObjectId(req.params.id);
    } catch (err) {
      return res.status(400).json({ message: "Invalid file ID format" });
    }

    await bucket.delete(fileId);

    console.log("File deleted successfully");
    res.json({ message: "File deleted successfully", fileId: fileId.toString() });
  } catch (err) {
    console.error("Delete error:", err);

    if (err.message.includes("FileNotFound")) {
      return res.status(404).json({ message: "File not found" });
    }

    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

export default router;