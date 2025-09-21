import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Spinner } from "../../shared/ui/Spinner";
import { getPrefs, setTheme, setUnits } from "../../data/stores/prefs";
import type { ThemeMode, Units } from "../../shared/types";
import { getSessionUserId, logout, startEmailOtp, verifyEmailOtp } from "../../data/sync/auth";
import { syncNow } from "../../data/sync/core";
import { db } from "../../data/db";
import { BackupCard } from "./BackupCard";
import { LogCard } from "./LogCard";

function Otp6({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = Array.from({ length: 6 }, () => React.useRef<HTMLInputElement>(null));
  useEffect(() => { refs[0]?.current?.focus(); }, []);
  const set = (i: number, ch: string) => {
    const next = (value.substring(0, i) + ch.replace(/\D/g, "").slice(0,1) + value.substring(i+1)).slice(0,6);
    onChange(next);
    if (ch && i < 5) refs[i+1].current?.focus();
  };
  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs[i-1].current?.focus();
    if (e.key === "ArrowLeft" && i>0) refs[i-1].current?.focus();
    if (e.key === "ArrowRight" && i<5) refs[i+1].current?.focus();
  };
  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0,6);
    if (t) {
      e.preventDefault();
      onChange(t.padEnd(6, ""));
      const idx = Math.min(5, t.length-1);
      refs[idx]?.current?.focus();
    }
  };
  return (
    <div className="flex gap-2" onPaste={onPaste}>
      {refs.map((r, i) => (
        <input
          key={i}
          ref={r}
          aria-label={`OTP Ziffer ${i+1}`}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          className="w-10 h-12 rounded-lg border border-zinc-700 bg-zinc-950 text-center text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          value={value[i] ?? ""}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => onKey(i, e)}
        />
      ))}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes < 1024) return `${bytes ?? 0} B`;
  const units = ["KB","MB","GB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length-1) { v /= 1024; i++; }
  return `${v.toFixed(1).replace(".", ",")} ${units[i]}`;
}


// --- App Version Footer (auto-added by v0.12.1) ---
import { APP_VERSION } from "../../config/app";
function AppVersionFooter() {
  return (
    <div className="mt-10 text-xs text-zinc-500 text-center select-none">
      Giannicorp Gym v{APP_VERSION}
    </div>
  );
}

export default function Profile() {
  const nav = useNavigate();

  // Prefs
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [units, setUnitsState] = useState<Units>("kg");

  // Auth
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [busySend, setBusySend] = useState(false);
  const [busyLogin, setBusyLogin] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [err, setErr] = useState<string>("");

  // Sync
  const [lastSync, setLastSync] = useState<string>("Noch nie");
  const [pending, setPending] = useState<number>(0);
  const [conflicts, setConflicts] = useState<number>(0);
  const [usage, setUsage] = useState<string>("-");
  const [syncBusy, setSyncBusy] = useState(false);

  // Load prefs/session
  useEffect(() => {
    void (async () => {
      const p = await getPrefs();
      setThemeState(p.theme ?? "dark");
      setUnitsState(p.units ?? "kg");
      setUserId(await getSessionUserId());
    })();
  }, []);

  // Cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Sync health
  useEffect(() => {
    void (async () => {
      try {
        const rows = await db.sync_state.toArray();
        const ts = rows
          .map((r) => r.last_pulled_at || r.last_pushed_at)
          .filter(Boolean)
          .map((s) => new Date(String(s)));
        if (ts.length > 0) {
          const max = ts.sort((a, b) => b.getTime() - a.getTime())[0];
          setLastSync(max.toLocaleString());
        } else {
          setLastSync("Noch nie");
        }
        setPending(await db._pending_changes.count());
        setConflicts(await db._sync_conflicts.count());
        if (navigator.storage && "estimate" in navigator.storage) {
          const est = await navigator.storage.estimate();
          setUsage(formatBytes(est.usage ?? 0));
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const statusText = useMemo(() => {
    if (!navigator.onLine) return "Offline";
    if (conflicts > 0) return "Konflikte vorhanden";
    return "OK";
  }, [conflicts]);

  return (
    <div className="mx-auto max-w-[900px] p-4 md:p-5 space-y-4">
      <h1 className="text-xl font-semibold">Profil</h1>

      {/* Einstellungen */}
      <Card>
        <div className="mb-2 font-medium">Einstellungen</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-zinc-400">Theme</div>
            <div className="flex gap-2 mt-1">
              <Button variant={theme === "dark" ? "solid" : "outline"} onClick={async () => { setThemeState("dark"); await setTheme("dark"); }}>Dark</Button>
              <Button variant={theme === "light" ? "solid" : "outline"} onClick={async () => { setThemeState("light"); await setTheme("light"); }}>Light</Button>
              <Button variant={theme === "system" ? "solid" : "outline"} onClick={async () => { setThemeState("system"); await setTheme("system"); }}>System</Button>
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-400">Einheiten</div>
            <div className="flex gap-2 mt-1">
              <Button variant={units === "kg" ? "solid" : "outline"} onClick={async () => { setUnitsState("kg"); await setUnits("kg"); }}>kg</Button>
              <Button variant={units === "lb" ? "solid" : "outline"} onClick={async () => { setUnitsState("lb"); await setUnits("lb"); }}>lb</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Sync */}
      <Card>
        <div className="mb-2 font-medium">Sync</div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-zinc-400">Letzter Sync</div>
            <div className="text-lg">{lastSync}</div>
            <div className="text-xs mt-1">DB-Größe: {usage} · Pending-Changes: {pending} · Status: {statusText}</div>
          </div>
          <Button
            onClick={async () => {
              try {
                setSyncBusy(true);
                await syncNow();
                // reload summary
                const rows = await db.sync_state.toArray();
                const ts = rows.map((r) => r.last_pulled_at || r.last_pushed_at).filter(Boolean).map((s) => new Date(String(s)));
                setLastSync(ts.length ? ts.sort((a,b)=>b.getTime()-a.getTime())[0].toLocaleString() : "Noch nie");
                setPending(await db._pending_changes.count());
                setConflicts(await db._sync_conflicts.count());
              } finally {
                setSyncBusy(false);
              }
            }}
            disabled={syncBusy}
          >
            {syncBusy ? <><Spinner /> <span className="ml-2">Synchronisiere…</span></> : "Jetzt synchronisieren"}
          </Button>
        </div>
      </Card>

      {/* Anmeldung */}
      <Card>
        <div className="mb-2 font-medium">Anmeldung</div>
        {userId ? (
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-400">Eingeloggt</div>
            <Button variant="outline" onClick={async () => { await logout(); setUserId(null); }}>Logout</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busySend || busyLogin} />
            <div className="flex items-center gap-2">
              <Button
                onClick={async () => {
                  if (cooldown > 0) return;
                  try {
                    setErr("");
                    setBusySend(true);
                    await startEmailOtp(email);
                    setCooldown(30);
                  } catch (e: any) {
                    setErr(e?.message ?? "Fehler beim Senden.");
                  } finally {
                    setBusySend(false);
                  }
                }}
                disabled={busySend || cooldown > 0 || !email}
              >
                {busySend ? <><Spinner /> <span className="ml-2">Sende…</span></> : (cooldown > 0 ? `Code senden (${cooldown}s)` : "Code senden")}
              </Button>
            </div>

            <Otp6 value={code} onChange={setCode} />

            <div className="flex items-center gap-2">
              <Button
                onClick={async () => {
                  try {
                    setErr("");
                    setBusyLogin(true);
                    await verifyEmailOtp(email, code.replace(/\D/g, ""));
                    // Verhindert AppLayout-Auto-Redirect auf /start
                    sessionStorage.setItem("gcg.signedin.once", "1");
                    nav("/dashboard");
                  } catch (e: any) {
                    setErr(e?.message ?? "Verifikation fehlgeschlagen.");
                  } finally {
                    setBusyLogin(false);
                  }
                }}
                disabled={busyLogin || code.replace(/\D/g, "").length !== 6 || !email}
              >
                {busyLogin ? <><Spinner /> <span className="ml-2">Prüfe…</span></> : "Login"}
              </Button>
              {err ? <div className="text-sm text-red-400">{err}</div> : null}
            </div>
          </div>
        )}
      </Card>

      <BackupCard />
      <Card>
        <h2 className="text-lg font-semibold mb-1">Zurücksetzen</h2>
        <p className="text-sm text-zinc-400 mb-2">Löscht ALLE lokalen Daten, meldet dich ab und startet die App neu.</p>
        <Button
          className="bg-red-600 hover:bg-red-500 border-red-500 text-white"
          onClick={async () => {
            if (!confirm("Alles lokal zurücksetzen und ausloggen? Das kann nicht rückgängig gemacht werden.")) return;
            const { hardResetAll } = await import("../../data/reset");
            await hardResetAll();
          }}
        >
          Alles zurücksetzen & abmelden
        </Button>
      </Card>

      <LogCard />
    </div>
  );
}


      <Card>
        <h2 className="text-lg font-semibold mb-2">Onboarding</h2>
        <Button variant="outline" onClick={async()=>{ const { resetOnboarding } = await import("../../data/stores/appSettings"); await resetOnboarding(); nav("/onboarding/welcome"); }}>
          Onboarding erneut starten
        </Button>
      </Card>
