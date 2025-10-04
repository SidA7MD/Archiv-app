import express from "express";
import { gfs } from "../config/db.js";
import upload from "../middleware/upload.js";
import mongoose from "mongoose";

const router = express.Router();

// Upload PDF
router.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    const { semester, type, subject, year } = req.body;
    if (!req.file) return res.status(400).json({ message: "PDF is required" });

    const writeStream = gfs.createWriteStream({
      filename: req.file.originalname,
      content_type: "application/pdf",
      metadata: { semester, type, subject, year },
    });

    writeStream.write(req.file.buffer);
    writeStream.end();

    writeStream.on("close", (file) => {
      res.status(201).json({ message: "PDF uploaded", fileId: file._id });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all PDFs or filter by metadata
router.get("/", async (req, res) => {
  const { semester, type, subject, year } = req.query;
  const query = {};
  if (semester) query["metadata.semester"] = semester;
  if (type) query["metadata.type"] = type;
  if (subject) query["metadata.subject"] = subject;
  if (year) query["metadata.year"] = year;

  gfs.files.find(query).toArray((err, files) => {
    if (!files || files.length === 0) return res.json([]);
    res.json(files);
  });
});

// Download/Open PDF by ID
router.get("/download/:id", async (req, res) => {
  try {
    const fileId = mongoose.Types.ObjectId(req.params.id);
    gfs.files.findOne({ _id: fileId }, (err, file) => {
      if (!file || file.length === 0)
        return res.status(404).json({ message: "PDF not found" });

      res.set("Content-Type", "application/pdf");
      res.set("Content-Disposition", `inline; filename="${file.filename}"`);

      const readStream = gfs.createReadStream({ _id: file._id });
      readStream.pipe(res);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
