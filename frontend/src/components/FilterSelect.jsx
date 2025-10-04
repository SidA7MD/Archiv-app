import React from "react";
import { ChevronDown } from "lucide-react";

const FilterSelect = ({
  value,
  onChange,
  options,
  label,
  defaultOption = "Select an option...",
}) => {
  return (
    <div className="w-full max-w-xs mx-auto">
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-600">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="
            w-full appearance-none rounded-2xl border border-gray-300 bg-white
            py-2.5 px-4 pr-10 text-gray-800 shadow-sm
            transition-all
            outline-none focus:outline-none focus:ring-0 focus:border-gray-400
          "
        >
          <option value="">{defaultOption}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2">
          <ChevronDown size={18} />
        </span>
      </div>
    </div>
  );
};

export default FilterSelect;
