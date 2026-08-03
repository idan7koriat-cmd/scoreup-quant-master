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

/**
 * קורא את הטוקן ישירות מ-localStorage ולא דרך הלקוח —
 * אתחול הלקוח תלוי בפונקציית שרת, וקריאה לו מתוך מידלוור של פונקציות שרת יוצרת תקיעה מעגלית.
 */
export function getExtAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("scoreup-ext-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { access_token?: string };
    return parsed?.access_token ?? null;
  } catch {
    return null;
  }
}
