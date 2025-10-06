import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Trouvez tout ce que vous souhaitez…" }) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative group">

        <span className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2">
          <Search size={20} />
        </span>


        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full py-3 pl-12 pr-12 text-gray-800 transition-all bg-white border border-gray-300 shadow-sm outline-none  rounded-2xl focus:outline-none focus:ring-0 focus:border-gray-400"
        />


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
              className="absolute text-gray-400 transition-colors -translate-y-1/2 right-4 top-1/2 hover:text-gray-600"
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
