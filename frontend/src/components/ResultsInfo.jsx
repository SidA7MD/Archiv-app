import React from "react";
import { XCircle } from "lucide-react";

const ResultsInfo = ({
  filteredCount,
  totalCount,
  hasActiveFilters,
  onClearFilters,
}) => {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 py-4">
      <p className="text-gray-600 text-sm md:text-base">
        Showing{" "}
        <span className="font-semibold text-primary">{filteredCount}</span> of{" "}
        <span className="font-semibold">{totalCount}</span> PDFs
      </p>

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="
            inline-flex items-center gap-2 text-sm text-gray-600
            hover:text-primary transition-colors
            outline-none focus:outline-none focus:ring-0
          "
        >
          <XCircle size={16} />
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default ResultsInfo;
