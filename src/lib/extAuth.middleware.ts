import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

export function extClient(token?: string) {
  const key = process.env["EXT_SUPABASE_ANON_KEY"]!;
  return createClient<any>(process.env["EXT_SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        if (token) h.set("Authorization", `Bearer ${token}`);
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** מאמת את המשתמש מול פרויקט ה-Supabase החיצוני ומחזיר לקוח שפועל בשמו. */
export const requireExtAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Unauthorized: No authorization header provided");
    }
    const token = authHeader.slice("Bearer ".length);
    if (!token) throw new Error("Unauthorized: No token provided");

    const supabase = extClient(token);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) throw new Error("Unauthorized: Invalid token");

    return next({ context: { supabase, userId: data.user.id, user: data.user } });
  },
);
