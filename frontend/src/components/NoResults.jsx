import React from "react";
import { FilterX } from "lucide-react";

const NoResults = ({ onClearFilters, hasFilters }) => {
  return (
    <div className="text-center py-16 px-6 bg-gray-50 rounded-2xl shadow-sm max-w-xl mx-auto mt-10">
      <div className="text-6xl mb-4">📭</div>
      
      <h3 className="text-2xl font-semibold mb-2 text-gray-800">
        No PDFs found
      </h3>
      
      <p className="text-gray-500 mb-6 text-base">
        No documents match your search criteria.
      </p>

      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="
            inline-flex items-center gap-2 px-5 py-2.5
            bg-primary text-white font-medium text-sm rounded-xl
            hover:bg-primary/90 transition-colors
            outline-none focus:outline-none focus:ring-0
          "
        >
          <FilterX size={18} />
          Clear filters to see all PDFs
        </button>
      )}
    </div>
  );
};

export default NoResults;
