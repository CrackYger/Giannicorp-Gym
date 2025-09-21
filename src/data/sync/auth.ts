import { supabase } from "../../config/supabase";

function assertEmail(email: string) {
  if (!/.+@.+\..+/.test(email)) throw new Error("Ungültige E-Mail.");
}
function assertCode(code: string) {
  if (!/^\d{6}$/.test(code)) throw new Error("Der Code muss 6 Ziffern haben.");
}

export async function startEmailOtp(email: string): Promise<void> {
  assertEmail(email);
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

export async function verifyEmailOtp(email: string, code: string): Promise<void> {
  assertEmail(email);
  assertCode(code);
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: code.trim(),
    type: "email",
  });
  if (error) {
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("expired") || msg.includes("invalid") || msg.includes("otp")) {
      throw new Error("Code abgelaufen oder ungültig.");
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSessionUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
