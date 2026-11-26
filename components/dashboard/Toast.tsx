"use client";

export interface ToastProps {
  toast: { message: string; type: "success" | "error" } | null;
}

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-[60] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-5 fade-in duration-300 ${
        toast.type === "success"
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "bg-red-500/10 border-red-500/20 text-red-400"
      }`}
    >
      <span className="text-xl">{toast.type === "success" ? "✅" : "❌"}</span>
      <p className="font-medium">{toast.message}</p>
    </div>
  );
}