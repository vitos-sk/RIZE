import { categoryDotColor, categoryTextColor } from "@/components/calendar/category-style";
import type { CategoryProgress } from "@/lib/logic/stats";

interface CategoryCompletionProps {
  periodLabel: string;
  categories: CategoryProgress[];
}

export function CategoryCompletion({ periodLabel, categories }: CategoryCompletionProps) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-muted">ВЫПОЛНЕНИЕ ПО КАТЕГОРИЯМ</span>
        <span className="text-xs text-muted">{periodLabel}</span>
      </div>

      {categories.length === 0 ? (
        <p className="py-2 text-sm text-muted">За этот период нет запланированных задач.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {categories.map(({ category, done, total }) => {
            const percent = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div key={category}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-fg">
                    <span className={`h-2.5 w-2.5 rounded-full ${categoryDotColor(category)}`} />
                    {category}
                  </span>
                  <span className={`text-sm font-bold ${categoryTextColor(category)}`}>{percent}%</span>
                </div>
                <div className="glass-inset h-2 w-full overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full ${categoryDotColor(category)}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {done} из {total} задач выполнено
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
