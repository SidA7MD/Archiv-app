import React from "react";
import { FilterX } from "lucide-react";

const NoResults = ({ onClearFilters, hasFilters }) => {
  return (
    <div className="max-w-xl px-6 py-16 mx-auto mt-10 text-center shadow-sm bg-gray-50 rounded-2xl">
      <div className="mb-4 text-6xl">📭</div>
      
      <h3 className="mb-2 text-2xl font-semibold text-gray-800">
        Aucun PDF trouvé
      </h3>
      
      <p className="mb-6 text-base text-gray-500">
        Aucun document ne correspond à vos critères de recherche.
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
          Réinitialiser les filtres pour voir tous les PDFs
        </button>
      )}
    </div>
  );
};

export default NoResults;
