import React from "react";
import FilterSelect from "../components/FilterSelect";
import { XCircle } from "lucide-react";

const FiltersSection = ({ filters, onFilterChange, onClearFilters, yearOptions }) => {
  const semesterOptions = [
    { value: "S1", label: "S1" },
    { value: "S2", label: "S2" },
    { value: "S3", label: "S3" },
    { value: "S4", label: "S4" },
    { value: "S5", label: "S5" },
    { value: "S6", label: "S6" },
  ];

  const typeOptions = [
    { value: "Cours", label: "Cours" },
    { value: "TD", label: "TD" },
    { value: "TP", label: "TP" },
    { value: "Devoirs", label: "Devoirs" },
    { value: "Compositions", label: "Compositions" },
    { value: "Rattrapage", label: "Rattrapage" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-4">
      <FilterSelect
        value={filters.semester}
        onChange={(value) => onFilterChange("semester", value)}
        options={semesterOptions}
        label="Semester"
        defaultOption="Tou Les Semesters"
      />

      <FilterSelect
        value={filters.type}
        onChange={(value) => onFilterChange("type", value)}
        options={typeOptions}
        label="Type"
        defaultOption="Tous Les Types"
      />

      <FilterSelect
        value={filters.year}
        onChange={(value) => onFilterChange("year", value)}
        options={yearOptions}
        label="Annees"
        defaultOption="Tous Les Annees"
      />

      <div className="flex items-end">
        <button
          onClick={onClearFilters}
          className="
            flex items-center justify-center gap-1 w-full py-2.5
            rounded-2xl border border-red-400 text-red-600 bg-white
            hover:bg-red-50 hover:text-red-700 hover:border-red-500
            text-sm font-medium transition-colors
            outline-none focus:outline-none focus:ring-0
          "
        >
          <XCircle size={18} />
          Effacer les filters
        </button>
      </div>
    </div>
  );
};

export default FiltersSection;
