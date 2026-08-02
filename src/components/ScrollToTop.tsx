import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

export function ScrollToTop() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = router.subscribe("onResolved", () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return unsubscribe;
  }, [router]);

  return null;
}
