import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { bucket } from "../config/db.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 16 * 1024 * 1024 
  }
});


router.post("/upload", upload.single("file"), (req, res) => {
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
});


router.delete("/delete/:id", async (req, res) => {
  try {
    if (!bucket) {
      return res.status(500).json({ message: "Database not connected" });
    }
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    await bucket.delete(fileId);

    res.json({ message: "File deleted successfully", fileId });
  } catch (err) {
    console.error("Delete error:", err);

    if (err.message.includes("FileNotFound")) {
      return res.status(404).json({ message: "File not found" });
    }
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});


router.put("/rename/:id", async (req, res) => {
  try {
    if (!bucket) {
      return res.status(500).json({ message: "Database not connected" });
    }
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const { newName } = req.body;

    if (!newName) {
      return res.status(400).json({ message: "New filename is required" });
    }
    const result = await bucket.s.db
      .collection("fs.files")
      .updateOne(
        { _id: fileId },
        { $set: { filename: newName } }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "File not found" });
    }
    res.json({ message: "File renamed successfully", fileId, newName });
  } catch (err) {
    console.error("Rename error:", err);
    res.status(500).json({ message: "Rename failed", error: err.message });
  }
});

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