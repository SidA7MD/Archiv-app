import React from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Download,
  BookOpen,
  CalendarDays,
  Layers,
  FileType,
  GraduationCap,
} from "lucide-react";

const PdfCard = ({ pdf, onView, onDownload }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="
        bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl
        shadow-sm hover:shadow-xl transition-all duration-300
        flex flex-col justify-between
      "
    >
      {/* Body */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="text-4xl flex-shrink-0">📄</div>
          <h2
            className="
              text-base md:text-lg font-semibold text-gray-800 leading-snug
              break-words w-full
            "
          >
            {pdf.filename || "Untitled"}
          </h2>
        </div>

        {/* Metadata */}
        <div className="space-y-3 text-sm">
          <MetaRow
            icon={<BookOpen size={16} />}
            label="Subject"
            value={pdf.metadata?.subject || "N/A"}
          />
          <MetaRow
            icon={<Layers size={16} />}
            label="Semester"
            value={pdf.metadata?.semester || "N/A"}
          />
          <MetaRow
            icon={<FileType size={16} />}
            label="Type"
            value={pdf.metadata?.type || "N/A"}
          />
          <MetaRow
            icon={<GraduationCap size={16} />}
            label="Year"
            value={pdf.metadata?.year || "N/A"}
          />
          <MetaRow
            icon={<CalendarDays size={16} />}
            label="Uploaded"
            value={formatDate(pdf.uploadDate)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-3 px-6 pb-5">
        <button
          onClick={() => onView(pdf._id)}
          className="
            inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            border border-gray-300 text-gray-700
            hover:bg-gray-100 transition-all
            outline-none focus:outline-none focus:ring-0
          "
        >
          <Eye size={16} />
          View
        </button>
        <button
          onClick={() => onDownload(pdf._id, pdf.filename)}
          className="
            inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            bg-primary text-white
            hover:bg-primary/90 transition-all
            outline-none focus:outline-none focus:ring-0
          "
        >
          <Download size={16} />
          Download
        </button>
      </div>
    </motion.div>
  );
};

const MetaRow = ({ icon, label, value }) => (
  <div className="flex justify-between items-center border-b border-gray-100 pb-1">
    <div className="flex items-center gap-2 text-gray-500">
      {icon}
      <span>{label}:</span>
    </div>
    <span className="font-medium text-gray-800 text-right max-w-[60%] break-words">
      {value}
    </span>
  </div>
);

export default PdfCard;
