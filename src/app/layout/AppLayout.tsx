import { NavLink, Outlet } from "react-router-dom";
import { RecoveryGate } from "../providers/RecoveryGate";
import { OnboardingGate } from "../providers/OnboardingGate";

const tabs = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/start", label: "Start" },
  { to: "/exercises", label: "Übungen" },
  { to: "/history", label: "Verlauf" },
  { to: "/profile", label: "Profil" },
] as const;

export function AppLayout() {
  return (
    <div className="font-system flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Recovery dialog lives inside Router context now */}
      <OnboardingGate />
      <RecoveryGate />
      <main className="flex-1 pb-[76px] sm:pb-[84px]">
        <Outlet />
      </main>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60"
        style={{ paddingBottom: "calc(16px + var(--safe-bottom))" }}
      >
        <div className="mx-auto flex max-w-screen-sm items-stretch gap-2 px-4 pt-2">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                [
                  "flex flex-1 items-center justify-center rounded-xl px-2 py-2 text-sm transition",
                  isActive ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200",
                ].join(" ")
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
