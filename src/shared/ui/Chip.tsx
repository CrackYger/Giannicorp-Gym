import * as React from "react";
type Size = "sm" | "md";
export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { size?: Size; active?: boolean; }
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(function Chip({ size="md", active=false, className="", disabled, children, ...rest }, ref) {
  const h = size === "sm" ? "h-7" : "h-9";
  const px = size === "sm" ? "px-2.5" : "px-3";
  const base = "inline-flex items-center justify-center rounded-lg border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 select-none";
  const colors = disabled ? "border-zinc-800 text-zinc-500 cursor-not-allowed opacity-60"
    : active ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
             : "border-zinc-700 text-zinc-200 hover:bg-zinc-800/60";
  const mono = "tabular-nums font-medium";
  return <button ref={ref} type="button" className={`${base} ${h} ${px} ${colors} ${mono} ${className}`} disabled={disabled} {...rest}>{children}</button>;
});