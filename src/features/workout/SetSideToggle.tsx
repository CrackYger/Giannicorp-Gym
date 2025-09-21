import React from "react";
import type { Side, Sidedness } from "../../shared/types";
import { Button } from "../../shared/ui/Button";

type Props = { sidedness?: Sidedness; side: Side; onChange: (s: Side) => void };

export function SetSideToggle({ sidedness, side, onChange }: Props) {
  if (!sidedness || sidedness === "bilateral") return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-400">Seite</span>
      <Button variant={side === "left" ? "primary" : "outline"} onClick={() => onChange("left")}>Links</Button>
      <Button variant={side === "right" ? "primary" : "outline"} onClick={() => onChange("right")}>Rechts</Button>
    </div>
  );
}
