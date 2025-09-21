import React from "react";

export function Spinner({ size = 16, className = "" }: { size?: number; className?: string }) {
  const style: React.CSSProperties = { width: size, height: size };
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-zinc-400 border-t-transparent ${className}`}
      style={style}
      aria-label="Lädt"
    />
  );
}
