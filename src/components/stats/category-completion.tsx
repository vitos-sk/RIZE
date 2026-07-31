import { PaperSheet } from "@/components/ui/paper-sheet";
import { paperCategoryDot } from "@/components/ui/paper-style";
import type { CategoryProgress } from "@/lib/logic/stats";

interface CategoryCompletionProps {
  periodLabel: string;
  categories: CategoryProgress[];
}

export function CategoryCompletion({ periodLabel, categories }: CategoryCompletionProps) {
  return (
    <PaperSheet innerClassName="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="font-hand text-xl leading-none font-bold text-ink">По категориям</span>
        <span className="font-note text-xs text-ink-soft">{periodLabel}</span>
      </div>

      {categories.length === 0 ? (
        <p className="py-2 font-note text-[0.95rem] text-ink-soft">
          За этот период нет запланированных задач.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {categories.map(({ category, done, total }) => {
            const percent = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div key={category}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-note text-[0.95rem] font-bold text-ink">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${paperCategoryDot(category)}`}
                      aria-hidden="true"
                    />
                    {category}
                  </span>
                  <span className="font-note text-[0.95rem] font-bold text-ink">{percent}%</span>
                </div>
                <div className="paper-inset h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-ink-green"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-1 font-note text-xs text-ink-soft">
                  {done} из {total} задач выполнено
                </p>
              </div>
            );
          })}
        </div>
      )}
    </PaperSheet>
  );
}
