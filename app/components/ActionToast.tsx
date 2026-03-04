"use client";

export type ToastType = "success" | "error";

type ActionToastProps = {
  type: ToastType;
  message: string;
  onClose: () => void;
};

export default function ActionToast({ type, message, onClose }: ActionToastProps) {
  const containerClass =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-800";
  const buttonClass = type === "success" ? "text-emerald-700 hover:bg-emerald-100" : "text-red-700 hover:bg-red-100";

  return (
    <div className="fixed right-4 top-4 z-[60] w-[min(92vw,420px)]" role="status" aria-live="polite">
      <div className={`rounded-lg border px-4 py-3 shadow ${containerClass}`}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className={`rounded px-2 py-1 text-xs font-semibold ${buttonClass}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
