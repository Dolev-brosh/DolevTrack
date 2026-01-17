import React from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  icon?: 'alert' | 'success';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  confirmVariant = "danger",
  icon = "alert"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-dark-800 border border-dark-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${icon === 'success' ? 'bg-neon-400/10 text-neon-400' : 'bg-red-500/10 text-red-500'}`}>
            {icon === 'success' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
          </div>
          
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-gray-400 leading-relaxed">{message}</p>

          <div className="flex gap-3 w-full mt-4">
            <Button variant="secondary" fullWidth onClick={onClose}>
              {cancelText}
            </Button>
            <Button variant={confirmVariant} fullWidth onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};