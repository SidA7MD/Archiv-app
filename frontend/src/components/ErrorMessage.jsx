import React from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-between w-full max-w-2xl mx-auto mt-6 px-4 py-3
                     rounded-xl border border-red-300 bg-red-50 text-red-800 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-sm font-medium">{message}</span>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700
                         transition-colors focus:outline-none"
            >
              <RotateCw size={16} />
             Réessayer
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorMessage;
