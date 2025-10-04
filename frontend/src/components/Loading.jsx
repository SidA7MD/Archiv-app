import React from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="text-primary"
      >
        <Loader2 size={48} strokeWidth={2.5} />
      </motion.div>

      <p className="mt-4 text-gray-600 text-lg font-medium">
        Loading PDFs...
      </p>
    </div>
  );
};

export default Loading;
