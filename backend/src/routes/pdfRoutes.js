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

// Upload PDF - CORRECTED VERSION
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

      const fileId = uploadStream.id;

      uploadStream.write(req.file.buffer, (error) => {
        if (error) {
          reject(error);
        } else {
          uploadStream.end();
        }
      });

      uploadStream.on("finish", () => {
        resolve(fileId);
      });

      uploadStream.on("error", (err) => {
        reject(err);
      });
    });

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

// Delete PDF by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    if (!bucket) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "PDF not found" });
    }

    await bucket.delete(fileId);
    
    res.status(200).json({ 
      message: "PDF deleted successfully",
      filename: files[0].filename
    });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

// Rename PDF by ID - CHANGED TO PUT
router.put("/rename/:id", async (req, res) => {
  try {
    if (!bucket) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const { newFilename } = req.body;
    if (!newFilename || !newFilename.trim()) {
      return res.status(400).json({ message: "New filename is required" });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "PDF not found" });
    }

    const db = bucket.s.db;
    const filesCollection = db.collection("fs.files");
    
    await filesCollection.updateOne(
      { _id: fileId },
      { $set: { filename: newFilename } }
    );

    res.status(200).json({ 
      message: "PDF renamed successfully",
      oldFilename: files[0].filename,
      newFilename: newFilename
    });

  } catch (err) {
    console.error("Rename error:", err);
    res.status(500).json({ message: "Rename failed", error: err.message });
  }
});

// Update PDF metadata - CHANGED TO PUT
router.put("/metadata/:id", async (req, res) => {
  try {
    if (!bucket) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const { semester, type, subject, year } = req.body;
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "PDF not found" });
    }

    const updateFields = {};
    if (semester) updateFields["metadata.semester"] = semester;
    if (type) updateFields["metadata.type"] = type;
    if (subject) updateFields["metadata.subject"] = subject;
    if (year) updateFields["metadata.year"] = year;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const db = bucket.s.db;
    const filesCollection = db.collection("fs.files");
    
    await filesCollection.updateOne(
      { _id: fileId },
      { $set: updateFields }
    );

    res.status(200).json({ 
      message: "PDF metadata updated successfully",
      updatedFields: updateFields
    });

  } catch (err) {
    console.error("Update metadata error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
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

// Get single PDF info by ID
router.get("/file/:id", async (req, res) => {
  try {
    if (!bucket) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const files = await bucket.find({ _id: fileId }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "PDF not found" });
    }

    res.json(files[0]);
  } catch (err) {
    console.error("Route error:", err);
    res.status(500).json({ message: "Error fetching file", error: err.message });
  }
});

export default router;