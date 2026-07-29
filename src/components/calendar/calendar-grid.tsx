import type { MonthGrid } from "@/types/calendar";
import { categoryDotColor } from "./category-style";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface CalendarGridProps {
  grid: MonthGrid;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function CalendarGrid({ grid, selectedDate, onSelectDate }: CalendarGridProps) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-x-1 pb-2 text-center text-xs font-medium text-muted">
        {WEEKDAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-x-1 gap-y-5">
        {grid.weeks.flat().map((cell) => {
          if (!cell.isCurrentMonth) {
            return <div key={cell.date} className="h-24" />;
          }

          const isSelected = cell.date === selectedDate;
          const statusClasses =
            cell.status === "completed"
              ? "border-success/40 bg-success/12"
              : cell.status === "missed"
                ? "border-danger/40 bg-danger/12"
                : cell.status === "future"
                  ? "border-white/6 bg-white/3"
                  : "";

          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              className={`glass-soft flex h-24 flex-col gap-0.5 overflow-hidden rounded-xl p-1.5 text-left transition-colors ${statusClasses} ${
                isSelected
                  ? "border-gold ring-2 ring-gold/60"
                  : cell.isToday
                    ? "border-gold/70"
                    : ""
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                  isSelected
                    ? "bg-gold text-bg"
                    : cell.isToday
                      ? "text-gold"
                      : cell.status === "future"
                        ? "text-muted"
                        : "text-fg"
                }`}
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
