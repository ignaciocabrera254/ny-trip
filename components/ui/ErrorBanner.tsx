import { TriangleAlert, X } from "lucide-react";

type Props = {
  message: string;
  onDismiss: () => void;
};

export default function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div
      role="alert"
      className="mx-4 mb-2 flex items-center gap-2 rounded-md border-2 border-danger bg-danger/10 px-3 py-2 text-sm font-semibold text-danger"
    >
      <TriangleAlert size={18} aria-hidden className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Cerrar aviso"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full cursor-pointer"
      >
        <X size={16} aria-hidden />
      </button>
    </div>
  );
}
