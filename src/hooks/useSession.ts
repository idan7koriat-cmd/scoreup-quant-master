import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getExtSupabase } from "@/lib/extAuthClient";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let active = true;

    getExtSupabase().then((supabase) => {
      if (!active) return;
      const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
        setSession(s);
        setLoading(false);
      });
      unsub = () => sub.subscription.unsubscribe();
      supabase.auth.getSession().then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setLoading(false);
      });
    });

    return () => {
      active = false;
      unsub?.();
    };
  }, []);

  return { session, loading };
}
