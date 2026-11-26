
"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
} from "react";

type DialogType = "alert" | "confirm";
type AlertType = "success" | "error" | "warning" | "info";

interface DialogOptions {
  id: number;
  title: string;
  message: string;
  type: DialogType;
  alertType?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface DialogContextType {
  showAlert: (
    title: string,
    message: string,
    alertType?: AlertType
  ) => void;

  showConfirm: (options: ConfirmOptions) => void;

  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(
  undefined
);

const ALERT_STYLES = {
  success: {
    icon: "✓",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    button: "bg-emerald-500 hover:bg-emerald-400 text-black",
  },
  error: {
    icon: "!",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    button: "bg-red-500 hover:bg-red-400 text-white",
  },
  warning: {
    icon: "⚠",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    button: "bg-amber-400 hover:bg-amber-300 text-black",
  },
  info: {
    icon: "i",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    button: "bg-sky-500 hover:bg-sky-400 text-black",
  },
};

export function DialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [dialog, setDialog] = useState<DialogOptions | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const dialogId = useRef(0);
  const processingRef = useRef(false);

  // ==========================================
  // MOSTRAR ALERT
  // ==========================================

  const showAlert = (
    title: string,
    message: string,
    alertType: AlertType = "info"
  ) => {
    processingRef.current = false;
    setIsProcessing(false);

    setDialog({
      id: ++dialogId.current,
      title,
      message,
      type: "alert",
      alertType,
      confirmText: "Entendido",
    });
  };

  // ==========================================
  // MOSTRAR CONFIRMACIÓN
  // ==========================================

  const showConfirm = (options: ConfirmOptions) => {
    processingRef.current = false;
    setIsProcessing(false);

    setDialog({
      ...options,
      id: ++dialogId.current,
      type: "confirm",
    });
  };

  // ==========================================
  // ATAJOS PARA TIPOS DE ALERTA
  // ==========================================

  const showSuccess = (title: string, message: string) =>
    showAlert(title, message, "success");

  const showError = (title: string, message: string) =>
    showAlert(title, message, "error");

  const showWarning = (title: string, message: string) =>
    showAlert(title, message, "warning");

  const showInfo = (title: string, message: string) =>
    showAlert(title, message, "info");

  // ==========================================
  // CERRAR DIÁLOGO
  // ==========================================

  const close = () => {
    if (processingRef.current) return;

    setDialog(null);
  };

  // ==========================================
  // CONFIRMAR ACCIÓN
  // ==========================================

  const handleConfirm = async () => {
    if (!dialog || processingRef.current) return;

    const currentDialog = dialog;

    // Los alerts solamente se cierran
    if (currentDialog.type === "alert") {
      close();
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);

    let failed = false;

    try {
      await currentDialog.onConfirm?.();

    } catch (error) {
      console.error("Error en diálogo:", error);

      failed = true;

      // Mostrar error sin perder el diálogo actual
      setDialog((previous) =>
        previous?.id === currentDialog.id
          ? {
              ...previous,
              type: "alert",
              alertType: "error",
              title: "No se pudo completar",
              message:
                error instanceof Error
                  ? error.message
                  : "Ocurrió un error inesperado.",
              confirmText: "Entendido",
              onConfirm: undefined,
            }
          : previous
      );

    } finally {
      processingRef.current = false;
      setIsProcessing(false);

      // No cerrar un nuevo diálogo abierto durante la operación
      // ni ocultar un mensaje de error.
      if (!failed) {
        setDialog((previous) =>
          previous?.id === currentDialog.id
            ? null
            : previous
        );
      }
    }
  };

  // ==========================================
  // CANCELAR ACCIÓN
  // ==========================================

  const handleCancel = async () => {
    if (!dialog || processingRef.current) return;

    const currentDialog = dialog;

    setDialog(null);

    try {
      await currentDialog.onCancel?.();
    } catch (error) {
      console.error("Error al cancelar diálogo:", error);
    }
  };

  // ==========================================
  // ESTILOS
  // ==========================================

  const alertStyle =
    dialog?.alertType
      ? ALERT_STYLES[dialog.alertType]
      : ALERT_STYLES.info;

  const isConfirm = dialog?.type === "confirm";

  return (
    <DialogContext.Provider
      value={{
        showAlert,
        showConfirm,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}

      {dialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isProcessing) {
              close();
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-message"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/70 bg-[#15181e] shadow-2xl animate-in zoom-in-95 duration-200"
          >
            {/* CONTENIDO */}

            <div className="px-6 pt-7 pb-6 text-center">

              <div
                className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl font-bold ${
                  isConfirm
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                    : `${alertStyle.border} ${alertStyle.bg} ${alertStyle.color}`
                }`}
              >
                {isConfirm ? "?" : alertStyle.icon}
              </div>

              <h3
                id="dialog-title"
                className="mb-2 text-xl font-bold tracking-tight text-white"
              >
                {dialog.title}
              </h3>

              <p
                id="dialog-message"
                className="text-sm leading-relaxed text-slate-400 whitespace-pre-line"
              >
                {dialog.message}
              </p>

            </div>

            {/* BOTONES */}

            <div className="flex gap-3 border-t border-slate-800 bg-[#1a1e26] p-4">

              {isConfirm && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {dialog.cancelText || "Cancelar"}
                </button>
              )}

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isConfirm
                    ? "bg-amber-400 text-black hover:bg-amber-300"
                    : alertStyle.button
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Procesando...
                  </span>
                ) : (
                  dialog.confirmText || "Aceptar"
                )}
              </button>

            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

// ==========================================
// HOOK
// ==========================================

export function useDialog() {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error(
      "useDialog debe ser usado dentro de un DialogProvider"
    );
  }

  return context;
}
