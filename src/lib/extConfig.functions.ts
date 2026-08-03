import { createServerFn } from "@tanstack/react-start";

/** מחזיר את הכתובת והמפתח הפומבי של פרויקט ה-Supabase החיצוני (ערכים פומביים בלבד). */
export const getExtConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ url: string; anonKey: string }> => ({
    url: process.env["EXT_SUPABASE_URL"]!,
    anonKey: process.env["EXT_SUPABASE_ANON_KEY"]!,
  }),
);
