import { useMemo } from "react";
import katex from "katex";

/** Renders one LaTeX expression with KaTeX, isolated LTR so RTL text doesn't flip it. */
export function MathSpan({ math }: { math: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        throwOnError: false,
        displayMode: false,
        output: "html",
      });
    } catch {
      return math;
    }
  }, [math]);

  return (
    <span
      dir="ltr"
      className="inline-block align-middle mx-0.5 [unicode-bidi:isolate]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Renders text that may contain inline math, either wrapped in $...$ or raw LaTeX. */
export function MathText({ children }: { children: string }) {
  const text = children ?? "";
  const looksLikeRawLatex = !text.includes("$") && /\\[a-zA-Z]+/.test(text);
  if (looksLikeRawLatex) return <MathSpan math={text} />;

  const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
          return <MathSpan key={i} math={part.slice(2, -2).trim()} />;
        }
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          return <MathSpan key={i} math={part.slice(1, -1).trim()} />;
        }
        return (
          <span key={i} className="whitespace-pre-line">
            {part}
          </span>
        );
      })}
    </>
  );
}
