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
import { AddTaskFlow } from "@/components/calendar/add-task-flow";

export default function CalendarPage() {
  const { user } = useAuth();
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const todayDate = useMemo(() => new Date(`${todayKey}T00:00:00.000Z`), [todayKey]);

  const [cursor, setCursor] = useState({ year: todayDate.getUTCFullYear(), month: todayDate.getUTCMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [addFlowOpen, setAddFlowOpen] = useState(false);
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

  function addTask(dateKey: string, category: string | null, title: string) {
    if (!user) return;
    createTask(user.uid, {
      title,
      category: category ?? "Без категории",
      type: "once",
      priority: 4,
      isNegative: false,
      schedule: [],
      dueDate: dateKey,
    }).catch(console.error);
  }

  function openAddFlow() {
    setSelectedDate(null);
    setAddFlowOpen(true);
  }

  if (!user) return null;

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] ?? []) : [];
  const selectedXP = selectedDate
    ? (logsByDate[selectedDate] ?? []).reduce((sum, log) => sum + log.xp, 0)
    : 0;

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-6">
        <CalendarHeader year={cursor.year} month={cursor.month} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} />
        <div className="mt-4">
          <CalendarGrid grid={grid} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>
      </div>

      <button
        type="button"
        onClick={openAddFlow}
        aria-label="Добавить новую задачу"
        className="absolute bottom-6 right-4 z-5 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-bg shadow-lg transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      {selectedDate && (
        <DayDetailSheet
          dateKey={selectedDate}
          tasks={selectedTasks}
          totalXP={selectedXP}
          onClose={() => setSelectedDate(null)}
          onToggleTask={(taskId) => {
            const summary = selectedTasks.find((task) => task.taskId === taskId);
            if (summary) toggleTask(selectedDate, taskId, !summary.done);
          }}
          onAddTaskClick={openAddFlow}
        />
      )}

      {addFlowOpen && (
        <AddTaskFlow
          todayKey={todayKey}
          initialCursor={cursor}
          tasksByDate={tasksByDate}
          logsByDate={logsByDate}
          onClose={() => setAddFlowOpen(false)}
          onSubmit={(dateKey, category, title) => {
            addTask(dateKey, category, title);
            setAddFlowOpen(false);
          }}
        />
      )}
    </div>
  );
}
