/** Renders raw inline SVG from the question bank inside a clean responsive card. */
export function QuestionDiagram({ svg }: { svg: string }) {
  return (
    <div className="mb-6 flex justify-center">
      <div
        dir="ltr"
        className="flex w-full max-w-md items-center justify-center rounded-2xl border border-border bg-background p-4 [&>svg]:h-auto [&>svg]:max-h-64 [&>svg]:w-auto [&>svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
