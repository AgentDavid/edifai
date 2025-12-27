import { AlertTriangle, Info } from "lucide-react";
import React from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconBg: "bg-red-100 text-red-600",
          buttonBg: "bg-red-600 hover:bg-red-700",
          icon: <AlertTriangle size={24} />,
        };
      case "warning":
        return {
          iconBg: "bg-orange-100 text-orange-600",
          buttonBg: "bg-orange-600 hover:bg-orange-700",
          icon: <AlertTriangle size={24} />,
        };
      case "primary":
      case "default":
      default:
        return {
          iconBg: "bg-blue-100 text-blue-600",
          buttonBg: "bg-blue-600 hover:bg-blue-700",
          icon: <Info size={24} />,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 p-2 rounded-full ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {title}
              </h3>
              <div className="text-slate-600 text-sm">{message}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors shadow-sm ${styles.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
