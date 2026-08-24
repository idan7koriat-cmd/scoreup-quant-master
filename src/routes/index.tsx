import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/scoreup/Navbar";
import { Hero } from "@/components/scoreup/Hero";
import { WhyScoreUp } from "@/components/scoreup/WhyScoreUp";
import { DemoPractice } from "@/components/scoreup/DemoPractice";
import { Faq } from "@/components/scoreup/Faq";
import { FinalCTA } from "@/components/scoreup/FinalCTA";
import { Footer } from "@/components/scoreup/Footer";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScoreUp — שפר את הציון בחלק הכמותי בפסיכומטרי" },
      {
        name: "description",
        content:
          "ScoreUp — למידה חכמה ותרגול ממוקד עם AI לחלק הכמותי בפסיכומטרי. פתרונות שלב-אחר-שלב, מאגר שאלות מעודכן וניתוח ביצועים בזמן אמת.",
      },
      { property: "og:title", content: "ScoreUp — שפר את הציון בפסיכומטרי כמותי" },
      {
        property: "og:description",
        content: "תרגול חכם עם AI, פתרונות מפורטים וניתוח ביצועים לחלק הכמותי בפסיכומטרי.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate({ to: "/dashboard", replace: true });
  }, [session, navigate]);

  return (
    <div className="su-theme-v2 min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <WhyScoreUp />
        <DemoPractice />
        <Faq />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
