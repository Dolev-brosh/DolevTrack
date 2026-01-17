import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000); 

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex justify-center pointer-events-none">
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="pointer-events-auto w-full max-w-md bg-dark-800 border border-green-500/50 shadow-2xl shadow-green-500/10 rounded-xl p-4 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="text-green-600 dark:text-green-400 shrink-0">
            <CheckCircle size={24} />
          </div>
          <p className="text-green-800 dark:text-green-50 text-sm font-medium truncate">
            {message}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0"
        >
          <X size={20} />
        </button>
      </motion.div>
    </div>
  );
};