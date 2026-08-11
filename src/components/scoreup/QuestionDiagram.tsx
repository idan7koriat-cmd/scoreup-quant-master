/** Renders raw inline SVG (or <img>) from the question bank on a bright canvas card for readability. */
export function QuestionDiagram({ svg }: { svg: string }) {
  return (
    <div className="my-3 flex w-full justify-center">
      <div
        dir="ltr"
        style={{ color: "#0F172A" }}
        className="inline-block max-w-full rounded-xl bg-white p-4 shadow-md
          [&_img]:mx-auto [&_img]:block [&_img]:max-h-64 [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain
          [&>svg]:mx-auto [&>svg]:block [&>svg]:h-auto [&>svg]:max-h-64 [&>svg]:w-auto [&>svg]:max-w-full
          [&_text]:fill-[#0F172A]"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
