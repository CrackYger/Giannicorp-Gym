import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../config/supabase";

type AuthState = {
  user: User | null;
  session: Session | null;
  status: "unknown" | "signed-in" | "signed-out";
};

const Ctx = createContext<AuthState>({ user: null, session: null, status: "unknown" });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, session: null, status: "unknown" });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setState({
        user: data.session?.user ?? null,
        session: data.session ?? null,
        status: data.session ? "signed-in" : "signed-out",
      });
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session: session ?? null,
        status: session ? "signed-in" : "signed-out",
      });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
