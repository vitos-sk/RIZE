/**
 * SVG-фильтры бумажной темы: шум смещает пиксели по краю, из-за чего ровный
 * прямоугольник выглядит оторванным руками. Вешать их можно только на пустые
 * фоновые слои (.paper-sheet-bg / .paper-chip-bg / .paper-tape) — текст под
 * таким фильтром «поплывёт».
 *
 * filterUnits="userSpaceOnUse" не используем: область фильтра задана в
 * процентах с запасом, иначе смещённый край обрежется по границе элемента.
 */
export function PaperDefs() {
  return (
    <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute h-0 w-0">
      <defs>
        <filter id="paper-torn" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014 0.05"
            numOctaves="4"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="9"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter id="paper-torn-soft" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.03 0.09"
            numOctaves="3"
            seed="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="4.5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
