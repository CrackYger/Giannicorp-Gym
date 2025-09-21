import type { PropsWithChildren } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
}

export function Modal({ open, onClose, title, children }: PropsWithChildren<Props>) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button className="absolute inset-0 bg-black/60" aria-label="Overlay" onClick={onClose} />
      <div className="z-10 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
        {title ? <h2 className="mb-2 text-lg font-semibold">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}
