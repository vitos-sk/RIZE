import { PaperSheet } from "@/components/ui/paper-sheet";
import { paperCategoryDot } from "@/components/ui/paper-style";
import { plural } from "@/lib/logic/plural";
import type { TaskTotals } from "@/lib/logic/task-totals";

interface TaskTotalsCardProps {
  totals: TaskTotals;
}

/** Больше шести полосок в телефон не влезает без каши — хвост сворачивается в строку. */
const VISIBLE_CATEGORIES = 6;

export function TaskTotalsCard({ totals }: TaskTotalsCardProps) {
  const { total, active, closed, projectSteps, categories, maxCategoryTotal } = totals;
  const visible = categories.slice(0, VISIBLE_CATEGORIES);
  const hidden = categories.slice(VISIBLE_CATEGORIES);
  const hiddenTotal = hidden.reduce((sum, category) => sum + category.total, 0);

  return (
    <PaperSheet innerClassName="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-note text-[0.9rem] text-ink-soft">Всего задач</p>
          <p className="font-hand text-[2.6rem] leading-none font-bold text-ink">{total}</p>
        </div>

        <div className="shrink-0 text-right font-note text-[0.8rem] leading-snug text-ink-soft">
          <p>
            <span className="font-bold text-ink">{active}</span>{" "}
            {plural(active, ["активная", "активные", "активных"])}
          </p>
          <p>
            <span className="font-bold text-ink">{closed}</span>{" "}
            {plural(closed, ["закрытая", "закрытые", "закрытых"])}
          </p>
        </div>
      </div>

      {categories.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2.5 border-t border-paper-line/70 pt-3">
          {visible.map(({ name, total: count }) => (
            <li key={name} className="flex items-center gap-3">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${paperCategoryDot(name)}`}
                aria-hidden="true"
              />
              <span className="w-24 shrink-0 truncate font-note text-[0.85rem] text-ink">{name}</span>

              {/* Полоска — доля категории от самой крупной, а не от всех задач:
                  иначе при десятке категорий все полоски вырождаются в точки. */}
              <span className="paper-inset h-2 min-w-0 flex-1 overflow-hidden rounded-full">
                <span
                  className="block h-full rounded-full bg-ink/35"
                  style={{ width: `${maxCategoryTotal > 0 ? (count / maxCategoryTotal) * 100 : 0}%` }}
                />
              </span>

              <span className="w-6 shrink-0 text-right font-hand text-lg leading-none font-bold text-ink">
                {count}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 border-t border-paper-line/70 pt-3 font-note text-[0.85rem] text-ink-soft">
          Задач пока нет — заведи первую на экране «Задачи».
        </p>
      )}

      {(hidden.length > 0 || projectSteps > 0) && (
        <p className="mt-3 font-note text-[0.8rem] text-ink-soft">
          {hidden.length > 0 && (
            <>
              ещё {hidden.length} {plural(hidden.length, ["категория", "категории", "категорий"])} —{" "}
              {hiddenTotal} {plural(hiddenTotal, ["задача", "задачи", "задач"])}
            </>
          )}
          {hidden.length > 0 && projectSteps > 0 && " · "}
          {projectSteps > 0 && (
            <>
              из них {projectSteps} {plural(projectSteps, ["шаг", "шага", "шагов"])} проектов
            </>
          )}
        </p>
      )}
    </PaperSheet>
  );
}
