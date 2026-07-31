import type { ReactNode } from "react";

// Перфорация по верхней кромке — как у вырванной страницы блокнота.
const HOLES = Array.from({ length: 14 }, (_, index) => index);

interface PaperSheetProps {
  children: ReactNode;
  /** Дырки от пружины по верхнему краю (списки задач). */
  perforated?: boolean;
  /** Вертикальная линия поля слева, как на разлинованном листе. */
  ruled?: boolean;
  className?: string;
  /** Классы контентного слоя — отступы задаём здесь, фон лежит слоем ниже. */
  innerClassName?: string;
}

/**
 * Лист бумаги: фон с рваным краем лежит отдельным слоем под контентом.
 * Иначе никак — SVG-фильтр `#paper-torn` смещает пиксели, и текст под ним поплыл бы.
 */
export function PaperSheet({
  children,
  perforated = false,
  ruled = false,
  className = "",
  innerClassName = "",
}: PaperSheetProps) {
  return (
    <div className={`paper-sheet ${className}`}>
      <div className="paper-sheet-bg absolute inset-0 rounded-[2px]" aria-hidden="true" />

      {perforated && (
        <div className="absolute inset-x-4 top-2.5 flex justify-between" aria-hidden="true">
          {HOLES.map((hole) => (
            <span key={hole} className="paper-hole h-3.5 w-3.5 rounded-full" />
          ))}
        </div>
      )}

      <div className={`relative ${perforated ? "pt-9" : ""} ${innerClassName}`}>
        {ruled && (
          <span className="paper-line absolute inset-y-1 left-3 w-px opacity-70" aria-hidden="true" />
        )}
        {children}
      </div>
    </div>
  );
}
