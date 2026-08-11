/** Renders raw inline SVG from the question bank on a clean white card for readability. */
export function QuestionDiagram({ svg }: { svg: string }) {
  return (
    <div className="mb-6 flex justify-center">
      <div
        dir="ltr"
        style={{ color: "#0F172A" }}
        className="flex w-full max-w-md items-center justify-center rounded-2xl border border-white/20 bg-white p-4 shadow-lg [&>svg]:h-auto [&>svg]:max-h-64 [&>svg]:w-auto [&>svg]:max-w-full [&_text]:fill-[#0F172A]"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
