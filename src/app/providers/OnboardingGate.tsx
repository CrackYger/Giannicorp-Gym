
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadAppSettings } from "../../data/stores/appSettings";

export function OnboardingGate() {
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    void (async () => {
      const s = await loadAppSettings();
      const isOnboardingRoute = loc.pathname.startsWith("/onboarding");
      if (!s.onboardedAt && !isOnboardingRoute) {
        nav("/onboarding/welcome", { replace: true });
      }
    })();
  }, [nav, loc.pathname]);

  return null;
}
