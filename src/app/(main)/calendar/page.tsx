"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { buildMonthGrid, getMonthGridDates } from "@/lib/logic/calendar";
import { buildCalendarData } from "@/lib/logic/calendar-data";
import { toDateKey } from "@/lib/logic/date";
import { createTask, setTaskCompletionForDate, subscribeAllTasks } from "@/lib/firebase/tasks";
import { subscribeLogsInRange } from "@/lib/firebase/logs";
import type { Task } from "@/types/task";
import type { Log } from "@/types/log";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { DayDetailSheet } from "@/components/calendar/day-detail-sheet";
import { PaperSheet } from "@/components/ui/paper-sheet";
import { TaskComposeFlow, type NewTaskInput } from "@/components/tasks/task-compose-flow";

export default function CalendarPage() {
  const { user } = useAuth();
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const todayDate = useMemo(() => new Date(`${todayKey}T00:00:00.000Z`), [todayKey]);

  const [cursor, setCursor] = useState({ year: todayDate.getUTCFullYear(), month: todayDate.getUTCMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [addFlowOpen, setAddFlowOpen] = useState(false);
  const [composeInitialDate, setComposeInitialDate] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);

  const dateKeys = useMemo(() => getMonthGridDates(cursor.year, cursor.month), [cursor]);

  useEffect(() => {
    if (!user) return;
    return subscribeAllTasks(user.uid, setTasks);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return subscribeLogsInRange(user.uid, dateKeys[0], dateKeys[dateKeys.length - 1], setLogs);
  }, [user, dateKeys]);

  const { tasksByDate, logsByDate } = useMemo(
    () => buildCalendarData(tasks, logs, dateKeys),
    [tasks, logs, dateKeys],
  );

  const categories = useMemo(
    () => Array.from(new Set(tasks.map((task) => task.category))).sort((a, b) => a.localeCompare(b, "ru")),
    [tasks],
  );

  const grid = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month, logsByDate, tasksByDate, todayKey),
    [cursor, logsByDate, tasksByDate, todayKey],
  );

  function changeMonth(delta: number) {
    setCursor(({ year, month }) => {
      const next = new Date(Date.UTC(year, month + delta, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
    setSelectedDate(null);
  }

  function toggleTask(dateKey: string, taskId: string, nextDone: boolean) {
    if (!user) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    setTaskCompletionForDate(user.uid, task, dateKey, nextDone).catch(console.error);
  }

  function handleCreateTask(input: NewTaskInput) {
    if (!user) return;
    createTask(user.uid, input).catch(console.error);
    setAddFlowOpen(false);
  }

  function openAddFlow(initialDate: string | null = null) {
    setComposeInitialDate(initialDate);
    setSelectedDate(null);
    setAddFlowOpen(true);
  }

  if (!user) return null;

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] ?? []) : [];

  return (
    <div className="paper-canvas relative flex h-full flex-col">
      <div className="mx-auto flex w-full max-w-md min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-7 pb-32">
        <header>
          <h1 className="font-hand text-[2.6rem] leading-none font-bold text-ink">Календарь</h1>
          <p className="mt-1.5 font-note text-sm text-ink-soft">Отмечай дни и держи ритм</p>
        </header>

        <CalendarHeader
          year={cursor.year}
          month={cursor.month}
          onPrev={() => changeMonth(-1)}
          onNext={() => changeMonth(1)}
        />

        <PaperSheet perforated innerClassName="px-1.5 pb-3">
          <CalendarGrid grid={grid} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </PaperSheet>
      </div>

      {/* Кнопка добавления — оторванный кружок оливковой бумаги, как на экране Задач. */}
      <button
        type="button"
        onClick={() => openAddFlow()}
        aria-label="Добавить новую задачу"
        className="paper-sheet absolute right-4 bottom-28 z-5 h-14 w-14 transition-transform active:scale-95"
      >
        <span className="paper-chip-bg-olive absolute inset-0 rounded-full" aria-hidden="true" />
        <span className="relative flex h-full w-full items-center justify-center">
          <Plus className="h-6 w-6 text-ink" strokeWidth={2.5} />
        </span>
      </button>

      {selectedDate && (
        <DayDetailSheet
          dateKey={selectedDate}
          tasks={selectedTasks}
          onClose={() => setSelectedDate(null)}
          onToggleTask={(taskId) => {
            const summary = selectedTasks.find((task) => task.taskId === taskId);
            if (summary) toggleTask(selectedDate, taskId, !summary.done);
          }}
          onAddTaskClick={() => openAddFlow(selectedDate)}
        />
      )}

      {addFlowOpen && (
        <TaskComposeFlow
          categories={categories}
          todayKey={todayKey}
          initialCursor={cursor}
          initialDate={composeInitialDate}
          tasksByDate={tasksByDate}
          logsByDate={logsByDate}
          onClose={() => setAddFlowOpen(false)}
          onSubmit={handleCreateTask}
        />
      )}
    </div>
  );
}
