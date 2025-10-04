import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search by filename or subject..." }) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative group">
        {/* Icon */}
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={20} />
        </span>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-12 pr-12 py-3 rounded-2xl border border-gray-300 bg-white
            text-gray-800 shadow-sm
            transition-all
            outline-none focus:outline-none focus:ring-0 focus:border-gray-400
          "
        />

        {/* Clear button */}
        <AnimatePresence>
          {value && (
            <motion.button
              key="clear-btn"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              type="button"
              onClick={() => onChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchBar;
