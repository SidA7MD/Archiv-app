import React from "react";
import { XCircle } from "lucide-react";

const ResultsInfo = ({
  filteredCount,
  totalCount,
  hasActiveFilters,
  onClearFilters,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
      <p className="text-sm text-gray-600 md:text-base">
        Montrant{" "}
        <span className="font-semibold text-primary">{filteredCount}</span> sur{" "}
        <span className="font-semibold">{totalCount}</span> PDFs
      </p>

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors outline-none  hover:text-primary focus:outline-none focus:ring-0"
        >
          <XCircle size={16} />
          Effacer les filters
        </button>
      )}
    </div>
  );
};

export default ResultsInfo;
