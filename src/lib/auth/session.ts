
/**
 * Dual hook for auth/session refresh:
 * - Supabase onAuthStateChange
 * - document.visibilitychange (silent refresh on refocus)
 */
export function installAuthLifecycle(supabase: { auth: { onAuthStateChange: (cb: any) => { data: { subscription: { unsubscribe: () => void } } }; refreshSession: () => Promise<any> } }, onErrorToast?: (msg: string) => void) {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (w.__giannicorp_auth_lifecycle) return;
  w.__giannicorp_auth_lifecycle = true;

  const sub = supabase.auth.onAuthStateChange((_event: any, _session: any) => {
    // No toast on success – only report failures during silent refresh
    // (explicit login flows should handle their own toasts)
  });

  const onVis = async () => {
    if (document.visibilityState === "visible") {
      try { await supabase.auth.refreshSession(); }
      catch (e: any) { onErrorToast?.("Sitzung konnte nicht erneuert werden. Bitte erneut anmelden."); }
    }
  };
  document.addEventListener("visibilitychange", onVis);
  // cleanup hook (optional; most apps keep this for app lifetime)
  return () => {
    document.removeEventListener("visibilitychange", onVis);
    sub?.data?.subscription?.unsubscribe?.();
  };
}
