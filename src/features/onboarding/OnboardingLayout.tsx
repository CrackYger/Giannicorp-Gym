
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { lazy, useEffect, useState } from "react";
import { loadAppSettings, saveAppSettings } from "../../data/stores/appSettings";
import { Card } from "../../shared/ui/Card";

const Welcome = lazy(() => import("./steps/Welcome"));
const Units = lazy(() => import("./steps/Units"));
const ExperienceGoal = lazy(() => import("./steps/ExperienceGoal"));
const FrequencyFocus = lazy(() => import("./steps/FrequencyFocus"));
const WorkoutDefaults = lazy(() => import("./steps/WorkoutDefaults"));
const Haptics = lazy(() => import("./steps/Haptics"));
const ImportStep = lazy(() => import("./steps/ImportStep"));
const StarterTemplate = lazy(() => import("./steps/StarterTemplate"));
const Finish = lazy(() => import("./steps/Finish"));

export function OnboardingLayout() {
  const [step, setStep] = useState<string>("welcome");
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    void (async () => {
      const s = await loadAppSettings();
      const current = (s.onboardingStep ?? "welcome");
      setStep(current);
      if (loc.pathname === "/onboarding" || loc.pathname === "/onboarding/") {
        nav(`/onboarding/${current}`, { replace: true });
      }
    })();
  }, []);

  useEffect(() => {
    const last = loc.pathname.split("/").pop() || "welcome";
    setStep(last);
    void saveAppSettings({ onboardingStep: last });
  }, [loc.pathname]);

  const steps = ["welcome","units","experience","frequency","defaults","haptics","import","starter","finish"] as const;
  const idx = steps.indexOf(step as any);
  return (
    <div className="mx-auto w-full max-w-md px-3 pb-[calc(env(safe-area-inset-bottom)+16px)]">
      <Stepper steps={steps as any} activeIndex={idx >=0 ? idx : 0} />
      <Outlet />
    </div>
  );
}

function Stepper({ steps, activeIndex }: { steps: string[]; activeIndex: number }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={["h-1 rounded-full", i<=activeIndex ? "bg-emerald-400" : "bg-zinc-800"].join(" ")} />
            <div className="mt-1 text-center text-[10px] uppercase tracking-wider text-zinc-500">{label(s)}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
function label(s: string) {
  switch (s) {
    case "welcome": return "Welcome";
    case "units": return "Units";
    case "experience": return "Experience";
    case "frequency": return "Frequency";
    case "defaults": return "Defaults";
    case "haptics": return "Haptics";
    case "import": return "Import";
    case "starter": return "Template";
    case "finish": return "Finish";
    default: return s;
  }
}

export default OnboardingLayout;
