import { useEffect, useState } from "react";
import { syncNow } from "../../data/sync/core";
import { installDexieSyncHooks } from "../../data/sync/hooks";

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    installDexieSyncHooks();
    setReady(true);
    void syncNow(); // App-Start
    const onVis = () => {
      if (document.visibilityState === "visible") void syncNow();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return <>{children}</>;
}
