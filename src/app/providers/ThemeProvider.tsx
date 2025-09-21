import { createContext, useContext, useEffect, useState } from "react";
import type { ThemeMode, Units } from "../../shared/types";
import { getPrefs, setTheme, setUnits } from "../../data/stores/prefs";

interface ThemeContextValue {
  theme: ThemeMode;
  units: Units;
  setThemeMode: (t: ThemeMode) => void;
  setUnitsPref: (u: Units) => void;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [units, setUnitsState] = useState<Units>("kg");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      const prefs = await getPrefs();
      setThemeState(prefs.theme);
      setUnitsState(prefs.units);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const setThemeMode = (t: ThemeMode) => {
    setThemeState(t);
    void setTheme(t);
  };
  const setUnitsPref = (u: Units) => {
    setUnitsState(u);
    void setUnits(u);
  };

  return (
    <ThemeContext.Provider value={{ theme, units, setThemeMode, setUnitsPref, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemePrefs() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemePrefs must be used within ThemeProvider");
  return ctx;
}
