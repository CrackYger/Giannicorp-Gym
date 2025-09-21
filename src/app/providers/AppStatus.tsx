import React from "react";
import { StatusBanner } from "../../shared/ui/StatusBanner";

export function AppStatus({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <StatusBanner />
      {children}
    </div>
  );
}
