import mongoose from "mongoose";

const pdfMetadataSchema = new mongoose.Schema({
  fileId: {              
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "fs.files"      
  },
  semester: {
    type: String,
    required: true,
    enum: ["S1", "S2", "S3", "S4", "S5"]
  },
  type: {
    type: String,
    required: true,
    enum: ["Cours", "TD", "TP", "Devoirs", "Compositions", "Rattrapage"]
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 2021
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("PdfMetadata", pdfMetadataSchema);
