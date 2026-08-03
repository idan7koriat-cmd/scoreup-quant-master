import { createMiddleware } from "@tanstack/react-start";
import { getExtAccessToken } from "@/lib/extAuthClient";

/** מצרף את טוקן הגישה של הפרויקט החיצוני לכל קריאת פונקציית שרת. */
export const attachExtAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const token = await getExtAccessToken().catch(() => null);
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
  },
);
