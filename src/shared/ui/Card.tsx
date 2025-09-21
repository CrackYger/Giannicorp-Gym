import type { PropsWithChildren } from "react";

export function Card({ children }: PropsWithChildren) {
  return <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">{children}</div>;
}
