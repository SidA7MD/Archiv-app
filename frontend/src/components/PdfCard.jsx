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
  Clipboard,
  RefreshCw,
  Code,
} from "lucide-react";

const typeThemes = {
  COURS: {
    Icon: BookOpen,
    gradient: "from-red-500 via-rose-600 to-red-700",
    buttonBg: "bg-gradient-to-r from-red-500 to-red-700",
    buttonText: "text-white",
    buttonHover: "hover:from-red-600 hover:to-red-800 hover:shadow-red-500/50",
    badgeBg: "bg-red-50 border-2 border-red-200",
    badgeText: "text-red-700",
    subjectBg: "bg-gradient-to-r from-red-500 to-red-700",
    subjectText: "text-white",
  },
  LAB: {
    Icon: FlaskConical,
    gradient: "from-purple-500 via-violet-600 to-indigo-600",
    buttonBg: "bg-gradient-to-r from-violet-500 to-purple-600",
    buttonText: "text-white",
    buttonHover:
      "hover:from-violet-600 hover:to-purple-700 hover:shadow-violet-500/50",
    badgeBg: "bg-violet-50 border-2 border-violet-200",
    badgeText: "text-violet-700",
    subjectBg: "bg-gradient-to-r from-violet-500 to-purple-500",
    subjectText: "text-white",
  },
  TD: {
    Icon: PenTool,
    gradient: "from-violet-500 via-purple-600 to-fuchsia-600",
    buttonBg: "bg-gradient-to-r from-violet-500 to-fuchsia-600",
    buttonText: "text-white",
    buttonHover:
      "hover:from-violet-600 hover:to-fuchsia-700 hover:shadow-violet-500/50",
    badgeBg: "bg-violet-50 border-2 border-violet-200",
    badgeText: "text-violet-700",
    subjectBg: "bg-gradient-to-r from-violet-500 to-purple-600",
    subjectText: "text-white",
  },
  DEVOIRS: {
    Icon: FileText,
    gradient: "from-emerald-400 via-teal-500 to-cyan-600",
    buttonBg: "bg-gradient-to-r from-teal-500 to-cyan-600",
    buttonText: "text-white",
    buttonHover:
      "hover:from-teal-600 hover:to-cyan-700 hover:shadow-teal-500/50",
    badgeBg: "bg-teal-50 border-2 border-teal-200",
    badgeText: "text-teal-700",
    subjectBg: "bg-gradient-to-r from-teal-500 to-cyan-500",
    subjectText: "text-white",
  },
  EXAM: {
    Icon: Trophy,
    gradient: "from-amber-400 via-orange-500 to-red-500",
    buttonBg: "bg-gradient-to-r from-orange-500 to-red-500",
    buttonText: "text-white",
    buttonHover:
      "hover:from-orange-600 hover:to-red-600 hover:shadow-orange-500/50",
    badgeBg: "bg-orange-50 border-2 border-orange-200",
    badgeText: "text-orange-700",
    subjectBg: "bg-gradient-to-r from-orange-500 to-red-500",
    subjectText: "text-white",
  },
  PROJECT: {
    Icon: Rocket,
    gradient: "from-sky-400 via-blue-500 to-indigo-600",
    buttonBg: "bg-gradient-to-r from-blue-500 to-sky-600",
    buttonText: "text-white",
    buttonHover:
      "hover:from-blue-600 hover:to-sky-700 hover:shadow-blue-500/50",
    badgeBg: "bg-sky-50 border-2 border-sky-200",
    badgeText: "text-sky-700",
    subjectBg: "bg-gradient-to-r from-blue-500 to-sky-500",
    subjectText: "text-white",
  },
  NOTES: {
    Icon: StickyNote,
    gradient: "from-slate-400 via-gray-500 to-zinc-600",
    buttonBg: "bg-gradient-to-r from-gray-500 to-slate-600",
    buttonText: "text-white",
    buttonHover:
      "hover:from-gray-600 hover:to-slate-700 hover:shadow-gray-500/50",
    badgeBg: "bg-gray-50 border-2 border-gray-200",
    badgeText: "text-gray-700",
    subjectBg: "bg-gradient-to-r from-gray-500 to-slate-500",
    subjectText: "text-white",
  },
  COMPOSITIONS: {
    Icon: Clipboard,
    gradient: "from-[#27667B] via-[#1F5566] to-[#15414A]",
    buttonBg: "bg-gradient-to-r from-[#27667B] to-[#15414A]",
    buttonText: "text-white",
    buttonHover:
      "hover:from-[#1F5A6F] hover:to-[#113842] hover:shadow-[#27667B]/50",
    badgeBg: "bg-[#7FB3C3] border-2 border-[#4A8A97]",
    badgeText: "text-[#15414A]",
    subjectBg: "bg-gradient-to-r from-[#27667B] to-[#1F5566]",
    subjectText: "text-white",
  },
  RATTRAPAGE: {
    Icon: RefreshCw,
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    buttonBg: "bg-gradient-to-r from-yellow-500 to-amber-600",
    buttonText: "text-white",
    buttonHover:
      "hover:from-yellow-600 hover:to-amber-700 hover:shadow-yellow-500/50",
    badgeBg: "bg-yellow-50 border-2 border-yellow-300",
    badgeText: "text-yellow-800",
    subjectBg: "bg-gradient-to-r from-yellow-500 to-amber-500",
    subjectText: "text-white",
  },
  TP: {
    Icon: Code,
    gradient: "from-cyan-400 via-blue-500 to-indigo-500",
    buttonBg: "bg-gradient-to-r from-cyan-500 to-blue-600",
    buttonText: "text-white",
    buttonHover:
      "hover:from-cyan-600 hover:to-blue-700 hover:shadow-cyan-500/50",
    badgeBg: "bg-cyan-50 border-2 border-cyan-300",
    badgeText: "text-cyan-800",
    subjectBg: "bg-gradient-to-r from-cyan-500 to-blue-500",
    subjectText: "text-white",
  },
};

const PdfCard = ({ pdf, onView, onDownload }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const rawType = (pdf.metadata?.type || "NOTES").toUpperCase();
  const typeTheme = typeThemes[rawType] || typeThemes["NOTES"];
  const TypeIcon = typeTheme.Icon;

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex flex-col h-[420px] bg-white rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-[1.03] hover:-rotate-1">
        <div
          className={`relative bg-gradient-to-br ${typeTheme.gradient} pt-7 pb-14 px-4 overflow-visible rounded-t-2xl`}
        >
          <Sparkles className="absolute z-20 w-5 h-5 top-4 right-6 text-white/40 animate-pulse" />
          <Star
            className="absolute z-20 w-4 h-4 top-8 left-6 text-white/30 animate-pulse"
            style={{ animationDelay: "1s" }}
          />

          <div className="relative z-10 flex justify-center">
            <TypeIcon className="w-16 h-16 text-white/90 drop-shadow-md" />
          </div>

          <div
            className="absolute left-0 right-0 z-0 h-12 bg-white -bottom-1"
            style={{
              borderTopLeftRadius: "50% 100%",
              borderTopRightRadius: "50% 100%",
            }}
          ></div>
        </div>

        <div className="flex flex-col flex-grow px-4 pt-1 pb-4 -mt-2 bg-white rounded-b-2xl">
          <h3 className="text-gray-900 font-bold text-lg text-center mb-2 line-clamp-2 min-h-[3rem] flex items-center justify-center">
            {pdf.filename?.replace(".pdf", "") || "Titre du Document"}
          </h3>

          {pdf.metadata?.subject && (
            <div
              className={`px-4 py-1.5 mx-auto mb-3 text-sm font-bold ${typeTheme.subjectBg} ${typeTheme.subjectText} rounded-full shadow-md`}
            >
              {pdf.metadata.subject}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2 mb-2">
            <div
              className={`${typeTheme.badgeBg} ${typeTheme.badgeText} text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors shadow-sm`}
            >
              <TypeIcon className="w-3.5 h-3.5" />
              {rawType}
            </div>

            {pdf.metadata?.year && (
              <div className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border-2 border-gray-200">
                <Calendar className="w-3.5 h-3.5" />
                {pdf.metadata.year}
              </div>
            )}

            {pdf.metadata?.semester && (
              <div className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border-2 border-green-200">
                <span className="font-bold">{pdf.metadata.semester}</span>
              </div>
            )}
          </div>

          <div className="mb-3 text-xs text-center text-gray-500">
            Mis en ligne le {formatDate(pdf.createdAt || pdf.uploadDate)}
          </div>

          <div className="mt-auto">
            <button
              onClick={() => onView(pdf._id)}
              className={`w-full ${typeTheme.buttonBg} ${typeTheme.buttonText} ${typeTheme.buttonHover} font-extrabold text-base py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
            >
              <span className="tracking-wide">OUVRIR</span>
              <span className="transition-transform transform group-hover:translate-x-1">
                →
              </span>
            </button>

            <button
              onClick={() => onDownload(pdf._id, pdf.filename)}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 mt-2 text-sm font-semibold text-gray-600 transition-all duration-300 bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 rounded-xl"
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
