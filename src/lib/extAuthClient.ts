import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getExtConfig } from "@/lib/extConfig.functions";

let clientPromise: Promise<SupabaseClient<any>> | null = null;

/** לקוח Supabase לדפדפן מול הפרויקט החיצוני — כאן נשמרים המשתמשים והפרופילים. */
export function getExtSupabase(): Promise<SupabaseClient<any>> {
  if (!clientPromise) {
    clientPromise = getExtConfig().then(({ url, anonKey }) => {
      const key = anonKey;
      return createClient<any>(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: "scoreup-ext-auth",
        },
        global: {
          fetch: (input, init) => {
            const h = new Headers(init?.headers);
            if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
              h.delete("Authorization");
            }
            h.set("apikey", key);
            return fetch(input, { ...init, headers: h });
          },
        },
      });
    });
  }
  return clientPromise;
}

export async function getExtAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const supabase = await getExtSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
