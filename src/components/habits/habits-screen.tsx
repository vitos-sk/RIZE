"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Skull } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaperSheet } from "@/components/ui/paper-sheet";
import { SwipeToDelete } from "@/components/tasks/swipe-to-delete";
import { TaskComposeFlow, type NewTaskInput } from "@/components/tasks/task-compose-flow";
import {
  completeTask,
  createTask,
  deleteTask,
  setTaskCompletionForDate,
  uncompleteTask,
} from "@/lib/firebase/tasks";
import { WEEKDAY_LABELS, formatDayMonth, fromDateKey } from "@/lib/logic/date";
import {
  HABIT_RATE_DAYS,
  buildHabitsScreen,
  type HabitDay,
  type HabitInsight,
} from "@/lib/logic/habits";
import type { Log } from "@/types/log";
import type { Task } from "@/types/task";

interface HabitsScreenProps {
  uid: string;
  tasks: Task[];
  logs: Log[];
  todayKey: string;
}

const SUGGESTED_CATEGORIES = ["Спорт", "Здоровье", "Учёба"];

/** «Каждый день» или перечисление дней — расписание привычки человеческими словами. */
function scheduleLabel(task: Task): string {
  if (task.schedule.length === 0 || task.schedule.length === WEEKDAY_LABELS.length) {
    return "Каждый день";
  }
  return WEEKDAY_LABELS.filter((day) => task.schedule.includes(day))
    .join(", ")
    .toLowerCase();
}

function dayLabel(count: number): string {
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 14) return "дней";
  const mod10 = count % 10;
  if (mod10 === 1) return "день";
  if (mod10 >= 2 && mod10 <= 4) return "дня";
  return "дней";
}

/**
 * Плитка дня в полосе. Цвет идёт от смысла привычки: у хорошей успех — это отметка,
 * у плохой — её отсутствие. День вне расписания остаётся пустым листом.
 */
function dayTone(day: HabitDay, isNegative: boolean): string {
  if (isNegative) {
    if (day.marked) return "bg-ink-red";
    return day.scheduled ? "bg-ink-green/45" : "bg-ink/8";
  }
  if (day.marked) return day.scheduled ? "bg-ink-green" : "bg-ink-green/40";
  if (!day.scheduled) return "bg-ink/8";
  // Сегодняшний день ещё не провален — он ждёт отметки, а не пропущен.
  return day.isToday ? "border-2 border-dashed border-ink-soft/60 bg-paper/50" : "bg-ink-red/35";
}

export function HabitsScreen({ uid, tasks, logs, todayKey }: HabitsScreenProps) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const data = useMemo(() => buildHabitsScreen(tasks, logs, todayKey), [tasks, logs, todayKey]);

  const categories = useMemo(() => {
    const set = new Set(SUGGESTED_CATEGORIES);
    tasks.forEach((task) => set.add(task.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
  }, [tasks]);

  const initialCursor = useMemo(() => {
    const date = fromDateKey(todayKey);
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
  }, [todayKey]);

  /**
   * Отметка привычки. Сегодняшнее выполнение хорошей привычки идёт через `completeTask` —
   * только оно двигает стрик активности пользователя. Срыв плохой привычки и правки
   * задним числом пишутся напрямую логом: наращивать стрик срывом было бы враньём.
   */
  async function toggleDay(insight: HabitInsight, day: HabitDay) {
    const { task } = insight;
    const key = `${task.id}_${day.dateKey}`;
    setPendingKey(key);
    try {
      if (!task.isNegative && day.isToday) {
        await (day.marked ? uncompleteTask(uid, task) : completeTask(uid, task));
      } else {
        await setTaskCompletionForDate(uid, task, day.dateKey, !day.marked);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPendingKey(null);
    }
  }

  async function confirmDelete() {
    if (!habitToDelete) return;
    setDeleting(true);
    try {
      await deleteTask(uid, habitToDelete.id);
      setHabitToDelete(null);
      setSwipedId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  function handleCreate(input: NewTaskInput) {
    setSheetOpen(false);
    createTask(uid, input).catch(console.error);
  }

  function renderStrip(insight: HabitInsight) {
    const { task } = insight;

    return (
      <div className="flex items-end gap-1">
        {insight.strip.map((day) => (
          <button
            key={day.dateKey}
            type="button"
            onClick={() => toggleDay(insight, day)}
            disabled={pendingKey === `${task.id}_${day.dateKey}`}
            aria-label={`${formatDayMonth(day.dateKey)}: ${day.marked ? "отмечено" : "не отмечено"}`}
            className={`h-7 flex-1 rounded-[3px] transition-transform active:scale-90 disabled:opacity-50 ${dayTone(
              day,
              task.isNegative,
            )}`}
          />
        ))}
      </div>
    );
  }

  function renderHabit(insight: HabitInsight) {
    const { task } = insight;
    const swiped = swipedId === task.id;
    const pendingToday = pendingKey === `${task.id}_${todayKey}`;
    const today = insight.strip[insight.strip.length - 1];

    return (
      <SwipeToDelete
        key={task.id}
        open={swiped}
        onOpenChange={(open) => setSwipedId(open ? task.id : null)}
        onDelete={() => setHabitToDelete(task)}
        label={`Удалить привычку «${task.title}»`}
      >
        <PaperSheet className={swiped ? "paper-row-bg" : ""} innerClassName="px-5 py-4">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="font-note text-[1.1rem] leading-tight font-bold text-ink">
                {task.title}
              </h2>
              <p className="mt-1 font-note text-[0.8rem] text-ink-soft">
                {task.isNegative ? (
                  <span className="flex items-center gap-1.5 font-bold text-ink-red">
                    <Skull className="h-3.5 w-3.5" />
                    Плохая привычка
                  </span>
                ) : (
                  scheduleLabel(task)
                )}
              </p>
            </div>

            {/* Серия — главная цифра карточки, поэтому крупным рукописным. */}
            <div className="shrink-0 text-right">
              <span
                className={`font-hand text-4xl leading-none font-bold ${
                  insight.streak > 0 ? "text-ink-green" : "text-ink-soft/70"
                }`}
              >
                {insight.streak}
              </span>
              <span className="mt-0.5 block font-note text-[0.7rem] text-ink-soft">
                {task.isNegative
                  ? `${dayLabel(insight.streak)} чисто`
                  : `${dayLabel(insight.streak)} подряд`}
              </span>
            </div>
          </div>

          <div className="mt-4">{renderStrip(insight)}</div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="font-note text-[0.78rem] text-ink-soft">
              {insight.rate === null
                ? `Ещё нет истории за ${HABIT_RATE_DAYS} дней`
                : `${insight.rate}% · ${insight.kept} из ${insight.planned} за ${HABIT_RATE_DAYS} дней`}
              {insight.bestStreak > insight.streak && ` · рекорд ${insight.bestStreak}`}
            </span>

            {task.isNegative ? (
              <button
                type="button"
                onClick={() => toggleDay(insight, today)}
                disabled={pendingToday}
                aria-pressed={insight.markedToday}
                className={`shrink-0 rounded-full border-2 px-4 py-1.5 font-note text-[0.85rem] transition-colors disabled:opacity-50 ${
                  insight.markedToday
                    ? "border-ink-red bg-ink-red/12 font-bold text-ink-red"
                    : "border-ink-soft/45 text-ink-soft hover:border-ink-red/60 hover:text-ink-red"
                }`}
              >
                {insight.markedToday ? "Сорвался сегодня" : "Сорвался"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => toggleDay(insight, today)}
                disabled={pendingToday}
                aria-pressed={insight.markedToday}
                aria-label={insight.markedToday ? "Снять отметку за сегодня" : "Отметить сегодня"}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-50 ${
                  insight.markedToday
                    ? "border-ink-green bg-ink-green/12"
                    : "border-ink-soft/55 bg-paper/40 hover:border-ink-soft"
                }`}
              >
                {insight.markedToday && <Check className="h-5 w-5 text-ink-green" strokeWidth={3} />}
              </button>
            )}
          </div>
        </PaperSheet>
      </SwipeToDelete>
    );
  }

  const isEmpty = data.good.length === 0 && data.bad.length === 0;

  return (
    <div className="paper-canvas relative flex h-full flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 overflow-y-auto px-5 pt-7 pb-32">
        <header>
          <h1 className="font-hand text-[2.6rem] leading-none font-bold text-ink">Привычки</h1>
          <p className="mt-1.5 font-note text-sm text-ink-soft">Серия важнее одного дня</p>
        </header>

        {!isEmpty && (
          <PaperSheet ruled innerClassName="px-5 py-4">
            <div className="flex items-stretch justify-between gap-3 text-center">
              <div className="flex-1">
                <span className="font-hand text-4xl leading-none font-bold text-ink-indigo">
                  {data.rate === null ? "—" : `${data.rate}%`}
                </span>
                <span className="mt-1 block font-note text-[0.72rem] text-ink-soft">
                  за {HABIT_RATE_DAYS} дней
                </span>
              </div>

              <span className="w-px shrink-0 bg-ink/10" aria-hidden="true" />

              <div className="flex-1">
                <span className="font-hand text-4xl leading-none font-bold text-ink-green">
                  {data.todayDone}
                  <span className="text-ink-soft">/{data.todayPlanned}</span>
                </span>
                <span className="mt-1 block font-note text-[0.72rem] text-ink-soft">сегодня</span>
              </div>

              <span className="w-px shrink-0 bg-ink/10" aria-hidden="true" />

              <div className="flex-1">
                <span className="font-hand text-4xl leading-none font-bold text-ink">
                  {data.topStreak}
                </span>
                <span className="mt-1 block font-note text-[0.72rem] text-ink-soft">
                  лучшая серия
                </span>
              </div>
            </div>
          </PaperSheet>
        )}

        {isEmpty ? (
          <PaperSheet perforated innerClassName="px-6 pt-2 pb-9">
            <p className="text-center font-note text-[0.95rem] text-ink-soft">
              Привычек пока нет. Привычка — это задача, которая повторяется по дням недели:
              добавь первую кнопкой «+».
            </p>
          </PaperSheet>
        ) : (
          // Строка привычки — <li> (его даёт SwipeToDelete), поэтому список настоящий.
          <ul className="flex flex-col gap-4">{data.good.map(renderHabit)}</ul>
        )}

        {data.bad.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="flex items-baseline gap-2.5 px-1 font-hand text-2xl leading-none font-bold text-ink">
              <span
                className="h-2.5 w-2.5 shrink-0 self-center rounded-full bg-ink-red"
                aria-hidden="true"
              />
              От чего отказываюсь
              <span className="font-note text-[0.8rem] font-normal text-ink-soft">
                серия растёт сама
              </span>
            </h2>
            <ul className="flex flex-col gap-4">{data.bad.map(renderHabit)}</ul>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-label="Добавить привычку"
        className="paper-sheet absolute right-4 bottom-28 z-5 h-14 w-14 transition-transform active:scale-95"
      >
        <span className="paper-chip-bg-olive absolute inset-0 rounded-full" aria-hidden="true" />
        <span className="relative flex h-full w-full items-center justify-center">
          <Plus className="h-6 w-6 text-ink" strokeWidth={2.5} />
        </span>
      </button>

      {habitToDelete && (
        <ConfirmDialog
          title={`Удалить «${habitToDelete.title}»?`}
          description="Привычка и вся её история удалятся навсегда — серия и статистика пересчитаются без неё."
          confirmLabel="Удалить"
          pending={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setHabitToDelete(null)}
        />
      )}

      {sheetOpen && (
        <TaskComposeFlow
          categories={categories}
          todayKey={todayKey}
          initialCursor={initialCursor}
          initialType="habit"
          onClose={() => setSheetOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}
