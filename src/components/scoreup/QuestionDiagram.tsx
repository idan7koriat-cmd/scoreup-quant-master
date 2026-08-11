const LIGHT_SVG_COLOR = /^(?:white|#fff(?:fff)?|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))$/i;

function makeDiagramReadable(markup: string) {
  if (typeof DOMParser === "undefined") return markup;

  const document = new DOMParser().parseFromString(markup, "image/svg+xml");
  const svg = document.documentElement;
  if (svg.tagName.toLowerCase() !== "svg" || document.querySelector("parsererror")) {
    return markup;
  }

  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.style.overflow = "visible";

  document.querySelectorAll<SVGElement>("*").forEach((element) => {
    const stroke = element.getAttribute("stroke")?.trim();
    const fill = element.getAttribute("fill")?.trim();
    const inlineStroke = element.style.stroke?.trim();
    const inlineFill = element.style.fill?.trim();

    if (stroke && LIGHT_SVG_COLOR.test(stroke)) element.setAttribute("stroke", "#0f172a");
    if (inlineStroke && LIGHT_SVG_COLOR.test(inlineStroke)) element.style.stroke = "#0f172a";

    if (element.tagName.toLowerCase() === "text") {
      if (fill && LIGHT_SVG_COLOR.test(fill)) element.setAttribute("fill", "#0f172a");
      if (inlineFill && LIGHT_SVG_COLOR.test(inlineFill)) element.style.fill = "#0f172a";
    }
  });

  return new XMLSerializer().serializeToString(svg);
}

/** Renders raw inline SVG (or <img>) from the question bank on a bright canvas. */
export function QuestionDiagram({ svg }: { svg: string }) {
  const readableSvg = makeDiagramReadable(svg);

  return (
    <div className="mx-auto my-4 flex max-w-md items-center justify-center rounded-xl border border-slate-300 bg-slate-100 p-4 shadow-md">
      <div
        dir="ltr"
        className="block max-w-full text-slate-900
          [&_img]:mx-auto [&_img]:block [&_img]:max-h-60 [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain
          [&>svg]:mx-auto [&>svg]:block [&>svg]:h-auto [&>svg]:max-h-60 [&>svg]:w-auto [&>svg]:max-w-full [&>svg]:object-contain [&>svg]:overflow-visible"
        dangerouslySetInnerHTML={{ __html: readableSvg }}
      />
    </div>
  );
}
