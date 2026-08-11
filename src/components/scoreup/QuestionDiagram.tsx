/** Renders raw inline SVG (or <img>) from the question bank on a bright, clean
 *  slate canvas so every dark stroke / label stays crisp and readable on the
 *  dark neon theme. No invert filters, no rounded-full. */
export function QuestionDiagram({ svg }: { svg: string }) {
  return (
    <div className="my-4 flex justify-center">
      <div
        dir="ltr"
        className="inline-block max-w-full rounded-xl border border-slate-300 bg-slate-100 p-4 shadow-md
          [&_img]:mx-auto [&_img]:block [&_img]:max-h-60 [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain
          [&>svg]:mx-auto [&>svg]:block [&>svg]:h-auto [&>svg]:max-h-60 [&>svg]:w-auto [&>svg]:max-w-full
          [&_text]:fill-[#0F172A] [&_path]:[stroke:currentColor] [&_line]:[stroke:currentColor] [&_circle]:[stroke:currentColor]"
        style={{ color: "#0F172A" }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
