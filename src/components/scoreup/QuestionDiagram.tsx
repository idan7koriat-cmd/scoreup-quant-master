/**
 * Question-bank SVGs only set a `viewBox` (no `width`/`height` attributes).
 * Browsers don't reliably size an inline <svg> from `width:auto;height:auto`
 * CSS alone in that case — it can collapse to zero height. Give it explicit
 * width/height (from the viewBox) so the CSS sizing rules below have a real
 * intrinsic size to work with.
 *
 * Plain string parsing (no DOMParser) so the output is identical whether
 * this runs on the server or the client — some routes render this via SSR,
 * and a client-only fix wouldn't survive hydration there.
 */
function withIntrinsicSize(markup: string): string {
  const openTag = markup.match(/^<svg\b[^>]*>/i)?.[0];
  if (!openTag || /\bwidth\s*=/i.test(openTag) || /\bheight\s*=/i.test(openTag)) {
    return markup;
  }

  const viewBox = openTag.match(/\bviewBox\s*=\s*["']([^"']+)["']/i)?.[1];
  const parts = viewBox?.trim().split(/[\s,]+/).map(Number) ?? [];
  if (parts.length !== 4 || !(parts[2] > 0) || !(parts[3] > 0)) return markup;

  const newOpenTag = openTag.replace(/^<svg\b/i, `<svg width="${parts[2]}" height="${parts[3]}"`);
  return markup.replace(openTag, newOpenTag);
}

/** Renders raw inline SVG (or <img>) from the question bank on a bright canvas. */
export function QuestionDiagram({ svg }: { svg: string }) {
  const markup = svg.trim();

  if (!markup || !/^<(?:svg|img)\b/i.test(markup)) return null;

  const readyMarkup = markup.startsWith("<svg") ? withIntrinsicSize(markup) : markup;

  return (
    <div className="mx-auto my-4 flex max-w-md items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-slate-100 p-4 shadow-md">
      <div
        dir="ltr"
        className="block max-w-full
          [&>img]:mx-auto [&>img]:block [&>img]:h-auto [&>img]:max-h-60 [&>img]:w-auto [&>img]:max-w-full [&>img]:object-contain
          [&>svg]:mx-auto [&>svg]:block [&>svg]:h-auto [&>svg]:max-h-60 [&>svg]:w-auto [&>svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: readyMarkup }}
      />
    </div>
  );
}
