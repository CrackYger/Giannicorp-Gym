export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
};

export function assertEnv() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    // In v0.1.0 we only initialize client if provided; no throwing to allow local-only usage
    return false;
  }
  return true;
}
