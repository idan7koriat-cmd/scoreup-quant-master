import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/scoreup/Navbar";
import { Hero } from "@/components/scoreup/Hero";
import { WhyScoreUp } from "@/components/scoreup/WhyScoreUp";
import { HowItWorks } from "@/components/scoreup/HowItWorks";
import { DemoPractice } from "@/components/scoreup/DemoPractice";
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
        content:
          "תרגול חכם עם AI, פתרונות מפורטים וניתוח ביצועים לחלק הכמותי בפסיכומטרי.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <WhyScoreUp />
        <DemoPractice />
        <HowItWorks />
        <FinalCTA />

      </main>
      <Footer />
    </div>
  );
}
