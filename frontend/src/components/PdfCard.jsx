import React from "react";
import {
  Download,
  BookOpen,
  FlaskConical,
  PenTool,
  FileText,
  Trophy,
  Rocket,
  StickyNote,
  Calendar,
  Sparkles,
  Star,
} from "lucide-react";

// --- Type-Based Color Themes (matching your vibrant S1–S5 style) ---

const typeThemes = {
  Lecture: {
    Icon: BookOpen,
    gradient: "from-orange-500 via-pink-500 to-fuchsia-600", // vivid warm red-pink like S1
    buttonBg: "bg-pink-600/10",
    buttonText: "text-pink-700",
    buttonHover: "hover:bg-pink-600/20",
    badgeBg: "bg-pink-100",
    badgeText: "text-pink-700",
  },
  Lab: {
    Icon: FlaskConical,
    gradient: "from-fuchsia-600 via-purple-600 to-violet-700", // deep purple like S2
    buttonBg: "bg-violet-600/10",
    buttonText: "text-violet-700",
    buttonHover: "hover:bg-violet-600/20",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-700",
  },
  Tutorial: {
    Icon: PenTool,
    gradient: "from-indigo-500 via-blue-600 to-violet-700", // indigo-blue like S3
    buttonBg: "bg-indigo-600/10",
    buttonText: "text-indigo-700",
    buttonHover: "hover:bg-indigo-600/20",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-700",
  },
  Assignment: {
    Icon: FileText,
    gradient: "from-teal-400 via-cyan-500 to-sky-500", // cool cyan like S4
    buttonBg: "bg-cyan-600/10",
    buttonText: "text-cyan-700",
    buttonHover: "hover:bg-cyan-600/20",
    badgeBg: "bg-cyan-100",
    badgeText: "text-cyan-700",
  },
  Exam: {
    Icon: Trophy,
    gradient: "from-amber-400 via-orange-500 to-red-500", // orange-yellow like S5
    buttonBg: "bg-orange-600/10",
    buttonText: "text-orange-700",
    buttonHover: "hover:bg-orange-600/20",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-700",
  },
  Project: {
    Icon: Rocket,
    gradient: "from-cyan-400 via-sky-500 to-blue-600", // dynamic blue-cyan
    buttonBg: "bg-sky-600/10",
    buttonText: "text-sky-700",
    buttonHover: "hover:bg-sky-600/20",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-700",
  },
  Notes: {
    Icon: StickyNote,
    gradient: "from-gray-400 via-slate-500 to-gray-600", // neutral fallback
    buttonBg: "bg-gray-600/10",
    buttonText: "text-gray-700",
    buttonHover: "hover:bg-gray-600/20",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-700",
  },
};

// --- French to English Type Mapping ---
const TYPE_MAPPINGS = {
  "COURS": "Lecture",
  "TD": "Tutorial",
  "DEVOIRS": "Assignment",
  "LAB": "Lab",
  "EXAM": "Exam",
  "PROJECT": "Project",
  "NOTES": "Notes",
};

// --- Component ---
const PdfCard = ({ pdf, onView, onDownload }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const rawType = (pdf.metadata?.type || "Notes").toUpperCase();
  const typeKey = TYPE_MAPPINGS[rawType] || "Notes";
  const typeTheme = typeThemes[typeKey] || typeThemes["Notes"];
  const TypeIcon = typeTheme.Icon;

  return (
    <div className="relative w-full">
      <div className="flex flex-col h-full overflow-hidden bg-white rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
        
        {/* Header Gradient */}
        <div
          className={`relative bg-gradient-to-br ${typeTheme.gradient} pt-10 pb-20 px-6 overflow-hidden`}
        >
          <Sparkles className="absolute w-5 h-5 top-6 right-8 text-white/40 animate-pulse" />
          <Star
            className="absolute w-4 h-4 top-10 left-8 text-white/30 animate-pulse"
            style={{ animationDelay: "1s" }}
          />

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <TypeIcon className="w-12 h-12 text-white/90 drop-shadow-md" />
          </div>

          {/* Subject */}
          <p className="text-xl font-black tracking-tight text-center uppercase text-white/90 drop-shadow-lg">
            {rawType}
          </p>

          {/* Curved bottom */}
          <div
            className="absolute left-0 right-0 h-16 bg-white -bottom-1"
            style={{
              borderTopLeftRadius: "50% 100%",
              borderTopRightRadius: "50% 100%",
            }}
          ></div>
        </div>

        {/* Body Section */}
        <div className="flex flex-col flex-grow px-6 pt-5 pb-6 bg-white">
          
          {/* Title */}
          <h3 className="text-gray-900 font-extrabold text-lg text-center mb-4 line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
            {pdf.filename?.replace(".pdf", "") || "Titre du Document"}
          </h3>

          {/* Metadata Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <div
              className={`${typeTheme.badgeBg} ${typeTheme.badgeText} text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors shadow-sm`}
            >
              <TypeIcon className="w-4 h-4" />
              {rawType}
            </div>

            {pdf.metadata?.year && (
              <div className="bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <Calendar className="w-4 h-4" />
                {pdf.metadata.year}
              </div>
            )}
          </div>

          {/* Upload Date */}
          <div className="mb-5 text-xs text-center text-gray-500">
            Mis en ligne le {formatDate(pdf.createdAt || pdf.uploadDate)}
          </div>

          {/* Buttons */}
          <div className="pt-1 mt-auto">
            <button
              onClick={() => onView(pdf._id)}
              className={`w-full ${typeTheme.buttonBg} ${typeTheme.buttonText} ${typeTheme.buttonHover} font-extrabold text-base py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg`}
            >
              <span className="tracking-wide">OUVRIR</span>
              <span className="transition-transform transform group-hover:translate-x-1">
                →
              </span>
            </button>

            <button
              onClick={() => onDownload(pdf._id, pdf.filename)}
              className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              title="Télécharger"
            >
              <Download size={16} />
              <span>Télécharger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfCard;
