import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST =
  (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? "https://us.i.posthog.com";

let initialized = false;

/** מאתחל את PostHog בצד הלקוח בלבד. אם VITE_POSTHOG_KEY לא מוגדר, המעקב פשוט מדולג. */
export function initPostHog() {
  if (initialized || typeof window === "undefined") return;
  if (!POSTHOG_KEY) {
    console.warn("[posthog] VITE_POSTHOG_KEY missing — analytics disabled");
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // we send $pageview manually on router navigation instead
    capture_pageleave: true,
  });
  initialized = true;
}

export function isPostHogReady() {
  return initialized;
}

export { posthog };
