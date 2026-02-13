
import React from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  onConfirm,
  onCancel,
  isDanger = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl transform transition-all scale-100">
        <div className="flex flex-col items-center text-center mb-6">
          {isDanger && <AlertTriangle size={48} className="text-red-500 mb-4" />}
          <h3 className="text-xl font-black text-white mb-2">{title}</h3>
          <p className="text-zinc-400 text-sm font-bold leading-relaxed">{message}</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            className="flex-1" 
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button 
            variant={isDanger ? "danger" : "primary"} 
            className="flex-1" 
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
