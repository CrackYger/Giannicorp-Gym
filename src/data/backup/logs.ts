import { db } from "../db";

export async function exportLocalLog(): Promise<void> {
  const info = {
    app: "Giannicorp Gym",
    version: "v0.6.0",
    ua: navigator.userAgent,
    platform: navigator.platform,
    time: new Date().toISOString(),
    online: navigator.onLine,
    screen: { w: window.innerWidth, h: window.innerHeight },
  };
  const conflicts = await db._sync_conflicts.orderBy("created_at").reverse().limit(20).toArray();
  const pending = await db._pending_changes.count();
  const payload = { info, conflicts, pending };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "giannicorp-gym-log.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
