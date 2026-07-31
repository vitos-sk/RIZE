import type { MonthGrid } from "@/types/calendar";
import { paperCategoryDot } from "@/components/ui/paper-style";

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
        className={`grid grid-cols-7 gap-x-1 pb-1 text-center font-note text-xs text-ink-soft ${
          compact ? "" : "pb-2"
        }`}
      >
        {WEEKDAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className={`grid grid-cols-7 ${compact ? "gap-1" : "gap-px"}`}>
        {grid.weeks.flat().map((cell) => {
          if (!cell.isCurrentMonth) {
            return <div key={cell.date} className={compact ? "h-9" : "h-22"} />;
          }

          const isSelected = cell.date === selectedDate;
          const hasTasks = cell.tasks.length > 0 || cell.hiddenCount > 0;

          if (compact) {
            const cellClasses = isSelected
              ? "bg-olive font-bold text-ink"
              : cell.isToday
                ? "text-ink underline decoration-ink-green decoration-2 underline-offset-2"
                : cell.status === "future"
                  ? "text-ink-soft"
                  : "text-ink";
            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => onSelectDate(cell.date)}
                className={`flex h-9 flex-col items-center justify-center gap-0.5 rounded-md font-note text-sm transition-colors ${cellClasses}`}
              >
                {cell.dayNumber}
                <span
                  className={`h-1 w-1 rounded-full ${
                    hasTasks ? (isSelected ? "bg-ink/60" : "bg-ink-green") : "bg-transparent"
                  }`}
                />
              </button>
            );
          }

          // День с закрытым планом — зелёные чернила, провал — красные, будущее гасим.
          const statusClasses =
            cell.status === "completed"
              ? "bg-ink-green/10"
              : cell.status === "missed"
                ? "bg-ink-red/10"
                : "";

          const numberClasses = isSelected
            ? "bg-olive font-bold text-ink"
            : cell.isToday
              ? "bg-ink-green/15 font-bold text-ink-green"
              : cell.status === "future"
                ? "text-ink-soft"
                : "text-ink";

          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              // Клетки разграфлённого листа: линовка вместо отдельных карточек.
              className={`flex h-22 flex-col gap-0.5 overflow-hidden p-1.5 text-left ring-[0.5px] ring-paper-line/70 transition-colors ${statusClasses} ${
                isSelected ? "ring-1 ring-ink-green/60" : ""
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full font-note text-sm ${numberClasses}`}
              >
                {cell.dayNumber}
              </span>

              <div className="flex flex-1 flex-col justify-end gap-0.5">
                {cell.tasks.map((task) => (
                  <div key={task.taskId} className="flex items-center gap-1">
                    <span
                      className={`h-1 w-1 shrink-0 rounded-full ${paperCategoryDot(task.category)}`}
                    />
                    <span className="truncate font-note text-[0.6rem] leading-none text-ink-soft">
                      {task.title}
                    </span>
                  </div>
                ))}
                {cell.hiddenCount > 0 && (
                  <span className="font-note text-[0.6rem] leading-none text-ink-soft">•••</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
