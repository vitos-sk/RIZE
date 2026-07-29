"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { buildMonthGrid } from "@/lib/logic/calendar";
import { xpForCompletion } from "@/lib/logic/xp";
import type { CalendarTaskSummary } from "@/types/calendar";
import type { Log } from "@/types/log";
import type { Priority } from "@/types/task";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { DayDetailSheet } from "@/components/calendar/day-detail-sheet";
import { AddTaskFlow } from "@/components/calendar/add-task-flow";

const MS_PER_DAY = 86_400_000;

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash << 5) - hash + value.charCodeAt(i);
  return Math.abs(hash);
}

const MOCK_POOL: { title: string; category: string; priority: Priority; isNegative: boolean }[] = [
  { title: "Утренняя пробежка", category: "Спорт", priority: 2, isNegative: false },
  { title: "Черновик отчёта", category: "Работа", priority: 1, isNegative: false },
  { title: "Тренировка в зале", category: "Спорт", priority: 1, isNegative: false },
  { title: "Читать 30 минут", category: "Разум", priority: 3, isNegative: false },
  { title: "Холодный душ", category: "Здоровье", priority: 4, isNegative: false },
  { title: "Без сахара", category: "Здоровье", priority: 3, isNegative: true },
];

function buildLogsForDay(dateKey: string, tasks: CalendarTaskSummary[]): Log[] {
  return tasks
    .filter((task) => task.done)
    .map((task) => ({
      id: `${task.taskId}-log`,
      taskId: task.taskId,
      date: dateKey,
      type: "daily",
      xp: xpForCompletion(task, true),
      onTime: true,
      createdAt: Date.now(),
    }));
}

function buildMockData(todayKey: string) {
  const tasksByDate: Record<string, CalendarTaskSummary[]> = {};
  const logsByDate: Record<string, Log[]> = {};
  const today = new Date(`${todayKey}T00:00:00.000Z`);

  for (let offset = -34; offset <= 10; offset++) {
    const date = new Date(today.getTime() + offset * MS_PER_DAY);
    const key = toDateKey(date);
    const seed = hashCode(key);
    const taskCount = 2 + (seed % 4);

    const dayTasks: CalendarTaskSummary[] = Array.from({ length: taskCount }, (_, i) => {
      const pick = MOCK_POOL[(seed + i) % MOCK_POOL.length];
      const done = offset < 0 ? (seed + i) % 5 !== 0 : offset === 0 ? (seed + i) % 2 === 0 : false;
      return {
        taskId: `${key}-${i}`,
        title: pick.title,
        category: pick.category,
        priority: pick.priority,
        isNegative: pick.isNegative,
        done,
      };
    });

    tasksByDate[key] = dayTasks;
    if (offset <= 0) {
      logsByDate[key] = buildLogsForDay(key, dayTasks);
    }
  }

  return { tasksByDate, logsByDate };
}

export default function CalendarPage() {
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const todayDate = useMemo(() => new Date(`${todayKey}T00:00:00.000Z`), [todayKey]);

  const [cursor, setCursor] = useState({ year: todayDate.getUTCFullYear(), month: todayDate.getUTCMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [addFlowOpen, setAddFlowOpen] = useState(false);
  const [mock, setMock] = useState(() => buildMockData(todayKey));

  const grid = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month, mock.logsByDate, mock.tasksByDate, todayKey),
    [cursor, mock, todayKey],
  );

  function changeMonth(delta: number) {
    setCursor(({ year, month }) => {
      const next = new Date(Date.UTC(year, month + delta, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
    setSelectedDate(null);
  }

  function toggleTask(dateKey: string, taskId: string) {
    setMock((prev) => {
      const updatedTasks = (prev.tasksByDate[dateKey] ?? []).map((task) =>
        task.taskId === taskId ? { ...task, done: !task.done } : task,
      );

      return {
        tasksByDate: { ...prev.tasksByDate, [dateKey]: updatedTasks },
        logsByDate: { ...prev.logsByDate, [dateKey]: buildLogsForDay(dateKey, updatedTasks) },
      };
    });
  }

  function addTask(dateKey: string, category: string | null, title: string) {
    setMock((prev) => {
      const newTask: CalendarTaskSummary = {
        taskId: `${dateKey}-${Date.now()}`,
        title,
        category: category ?? "Без категории",
        priority: 4,
        isNegative: false,
        done: false,
      };

      return {
        ...prev,
        tasksByDate: { ...prev.tasksByDate, [dateKey]: [...(prev.tasksByDate[dateKey] ?? []), newTask] },
      };
    });
  }

  function openAddFlow() {
    setSelectedDate(null);
    setAddFlowOpen(true);
  }

  const selectedTasks = selectedDate ? (mock.tasksByDate[selectedDate] ?? []) : [];
  const selectedXP = selectedDate
    ? (mock.logsByDate[selectedDate] ?? []).reduce((sum, log) => sum + log.xp, 0)
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
        className="absolute bottom-6 right-4 z-[5] flex h-14 w-14 items-center justify-center rounded-full bg-gold text-bg shadow-lg transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      {selectedDate && (
        <DayDetailSheet
          dateKey={selectedDate}
          tasks={selectedTasks}
          totalXP={selectedXP}
          onClose={() => setSelectedDate(null)}
          onToggleTask={(taskId) => toggleTask(selectedDate, taskId)}
          onAddTaskClick={openAddFlow}
        />
      )}

      {addFlowOpen && (
        <AddTaskFlow
          todayKey={todayKey}
          initialCursor={cursor}
          tasksByDate={mock.tasksByDate}
          logsByDate={mock.logsByDate}
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
