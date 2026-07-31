import type { MonthGrid } from "@/types/calendar";
import { categoryDotColor } from "./category-style";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface CalendarGridProps {
  grid: MonthGrid;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  /**
   * Компактная сетка для выбора дня в форме создания задачи: квадратные ячейки
   * с одним числом и точкой-индикатором вместо списка задач — так месяц влезает
   * в шторку целиком, без прокрутки.
   */
  compact?: boolean;
}

export function CalendarGrid({ grid, selectedDate, onSelectDate, compact = false }: CalendarGridProps) {
  return (
    <div>
      <div
        className={`grid grid-cols-7 gap-x-1 text-center font-medium text-muted ${
          compact ? "pb-1 text-[11px]" : "pb-2 text-xs"
        }`}
      >
        {WEEKDAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className={`grid grid-cols-7 gap-x-1 ${compact ? "gap-y-1" : "gap-y-5"}`}>
        {grid.weeks.flat().map((cell) => {
          if (!cell.isCurrentMonth) {
            return <div key={cell.date} className={compact ? "h-9" : "h-24"} />;
          }

          const isSelected = cell.date === selectedDate;
          // День с выполнением — золотом, провал — красным, будущее гасим.
          // Сегодня/выбранный различаются силой грани, поэтому золото не путается.
          const statusClasses =
            cell.status === "completed"
              ? "border-gold/25 bg-gold/10"
              : cell.status === "missed"
                ? "border-danger/25 bg-danger/8"
                : cell.status === "future"
                  ? "border-white/6 bg-white/3"
                  : "";

          const selectionClasses = isSelected
            ? "border-gold ring-2 ring-gold/60"
            : cell.isToday
              ? "border-gold/70"
              : "";

          const numberClasses = isSelected
            ? "bg-gold text-bg"
            : cell.isToday
              ? "text-gold"
              : cell.status === "future"
                ? "text-muted"
                : "text-fg";

          if (compact) {
            const hasTasks = cell.tasks.length > 0 || cell.hiddenCount > 0;
            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => onSelectDate(cell.date)}
                className={`glass-soft flex h-9 flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-semibold transition-colors ${statusClasses} ${selectionClasses} ${
                  isSelected ? "bg-gold text-bg" : numberClasses
                }`}
              >
                {cell.dayNumber}
                <span
                  className={`h-1 w-1 rounded-full ${
                    hasTasks
                      ? isSelected
                        ? "bg-bg/70"
                        : categoryDotColor(cell.tasks[0]?.category ?? "")
                      : "bg-transparent"
                  }`}
                />
              </button>
            );
          }

          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              className={`glass-soft flex h-24 flex-col gap-0.5 overflow-hidden rounded-xl p-1.5 text-left transition-colors ${statusClasses} ${selectionClasses}`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${numberClasses}`}
              >
                {cell.dayNumber}
              </span>

              <div className="flex flex-1 flex-col justify-end gap-0.5">
                {cell.tasks.map((task) => (
                  <div key={task.taskId} className="flex items-center gap-1">
                    <span className={`h-1 w-1 shrink-0 rounded-full ${categoryDotColor(task.category)}`} />
                    <span className="truncate text-[9px] leading-none text-muted">{task.title}</span>
                  </div>
                ))}
                {cell.hiddenCount > 0 && (
                  <span className="text-[9px] leading-none text-muted">•••</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
