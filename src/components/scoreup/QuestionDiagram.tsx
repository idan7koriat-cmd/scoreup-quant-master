/** Renders raw inline SVG (or <img>) from the question bank on a bright canvas. */
export function QuestionDiagram({ svg }: { svg: string }) {
  const markup = svg.trim();

  if (!markup || !/^<(?:svg|img)\b/i.test(markup)) return null;

  return (
    <div className="mx-auto my-4 flex max-w-md items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-slate-100 p-4 shadow-md">
      <div
        dir="ltr"
        className="block max-w-full
          [&>img]:mx-auto [&>img]:block [&>img]:h-auto [&>img]:max-h-60 [&>img]:w-auto [&>img]:max-w-full [&>img]:object-contain
          [&>svg]:mx-auto [&>svg]:block [&>svg]:h-auto [&>svg]:max-h-60 [&>svg]:w-auto [&>svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </div>
  );
}
