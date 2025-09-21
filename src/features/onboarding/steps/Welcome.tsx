import { useState } from "react";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { saveAppSettings } from "../../../data/stores/appSettings";
import { useNavigate } from "react-router-dom";
import { FeatureCarousel } from "../FeatureCarousel";
import { CapabilitySheet } from "../CapabilitySheet";
import { ONB } from "../../../i18n/onboarding.de";

export default function Welcome() {
  const nav = useNavigate();
  const [sheet, setSheet] = useState(false);

  async function onLater() {
    await saveAppSettings({ onboardingStep: "units" });
    nav("/onboarding/units");
  }

  return (
    <Card className="glass rounded-2xl shadow-card border border-white/10 dark:border-white/5">
      <h1 className="text-2xl font-semibold mb-2">{ONB.welcome_title}</h1>
      <p className="text-base se:text-sm text-zinc-400 mb-3">{ONB.welcome_body}</p>

      <FeatureCarousel
        cards={[
          { title: "Schnell loggen", body: "Einhand-Flow ohne Friktion." },
          { title: "Besser planen", body: "Vorlagen & Frequenz, die zu dir passt." },
          { title: "PR & Fortschritt", body: "Sieh klar, wo du stehst." },
        ]}
      />

      <div className="mt-3">
        <button
          className="rounded-2xl px-4 py-2 min-h-[44px] border border-zinc-700/60"
          onClick={() => setSheet(true)}
        >
          {ONB.capability_button}
        </button>
      </div>

      <CapabilitySheet open={sheet} onClose={() => setSheet(false)} />
    </Card>
  );
}
