import React from "react";
type Props = { isOpen: boolean; onClose: () => void; ariaLabel: string; children: React.ReactNode; };
export const Modal: React.FC<Props> = ({ isOpen, onClose, ariaLabel, children }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => { if (!isOpen) return; const prev = document.activeElement as HTMLElement | null;
    const focusable = ref.current?.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"); focusable?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey); return () => { document.removeEventListener("keydown", onKey); prev?.focus(); }; }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (<div role="dialog" aria-label={ariaLabel} aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div ref={ref} className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-lg w-[92vw] outline-none p-2">{children}</div></div>);
};
