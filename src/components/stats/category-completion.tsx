interface CategoryProgress {
  category: string;
  done: number;
  total: number;
}

const CATEGORY_STYLES: Record<string, { dot: string; text: string; bar: string }> = {
  Работа: { dot: "bg-blue-500", text: "text-blue-400", bar: "bg-blue-500" },
  Спорт: { dot: "bg-success", text: "text-success", bar: "bg-success" },
  Учёба: { dot: "bg-purple-500", text: "text-purple-400", bar: "bg-purple-500" },
};

const FALLBACK_STYLE = { dot: "bg-muted", text: "text-muted", bar: "bg-muted" };

interface CategoryCompletionProps {
  periodLabel: string;
  categories: CategoryProgress[];
}

export function CategoryCompletion({ periodLabel, categories }: CategoryCompletionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-muted">ВЫПОЛНЕНИЕ ПО КАТЕГОРИЯМ</span>
        <span className="text-xs text-muted">{periodLabel}</span>
      </div>

      <div className="flex flex-col gap-4">
        {categories.map(({ category, done, total }) => {
          const style = CATEGORY_STYLES[category] ?? FALLBACK_STYLE;
          const percent = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <div key={category}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-fg">
                  <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                  {category}
                </span>
                <span className={`text-sm font-bold ${style.text}`}>{percent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full ${style.bar}`}
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
    </div>
  );
}
