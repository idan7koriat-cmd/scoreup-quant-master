import { createServerFn } from "@tanstack/react-start";
import { extClient } from "@/lib/extAuth.middleware";

export type UnsubscribeMarketingResult = { ok: true } | { ok: false; reason: "send_failed" };

/** מטרת לינק ההסרה במיילי דיוור. פתוח לכולם — נקרא בלי session מקליק במייל. */
export const unsubscribeMarketing = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }): Promise<UnsubscribeMarketingResult> => {
    const payload = (data as any)?.data ?? data;
    const userId = String(payload.userId ?? "").trim();
    if (!userId) return { ok: false, reason: "send_failed" };

    const supabase = extClient();
    const { error } = await supabase.rpc("unsubscribe_marketing", { p_user_id: userId });
    if (error) {
      console.error("[unsubscribeMarketing] rpc error:", error.message);
      return { ok: false, reason: "send_failed" };
    }
    return { ok: true };
  });
