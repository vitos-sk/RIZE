"use client";

import { useState } from "react";
import {
  Ban,
  BookOpen,
  Flame,
  Flower2,
  Footprints,
  ListFilter,
  MoreVertical,
  Plus,
  ShowerHead,
  Skull,
} from "lucide-react";
import type { ComponentType } from "react";

type DayStatus = "done" | "broken" | "pending";

interface HabitItem {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  streak: number;
  isNegative: boolean;
  isBest?: boolean;
  week: DayStatus[];
}

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const HABITS: HabitItem[] = [
  {
    id: "1",
    title: "Утренняя пробежка",
    icon: Footprints,
    streak: 12,
    isNegative: false,
    isBest: true,
    week: ["done", "done", "done", "done", "done", "done", "pending"],
  },
  {
    id: "2",
    title: "Читать 30 мин",
    icon: BookOpen,
    streak: 8,
    isNegative: false,
    week: ["done", "done", "done", "done", "done", "pending", "pending"],
  },
  {
    id: "3",
    title: "Без сахара",
    icon: Ban,
    streak: 15,
    isNegative: false,
    week: ["done", "done", "done", "done", "done", "done", "done"],
  },
  {
    id: "4",
    title: "Холодный душ",
    icon: ShowerHead,
    streak: 6,
    isNegative: false,
    week: ["done", "done", "done", "pending", "pending", "pending", "pending"],
  },
  {
    id: "5",
    title: "Медитация",
    icon: Flower2,
    streak: 4,
    isNegative: false,
    week: ["done", "done", "pending", "done", "pending", "done", "pending"],
  },
  {
    id: "6",
    title: "Без алкоголя",
    icon: Skull,
    streak: 3,
    isNegative: true,
    week: ["done", "done", "broken", "pending", "pending", "pending", "pending"],
  },
];

function ringPercent(week: DayStatus[]) {
  const filled = week.filter((d) => d === "done").length;
  return filled / week.length;
}

function HabitRing({ habit }: { habit: HabitItem }) {
  const size = 96;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = ringPercent(habit.week);
  const dashOffset = circumference * (1 - percent);
  const ringColor = habit.isNegative ? "text-danger" : "text-gold";

  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="text-white/15"
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={ringColor}
          stroke="currentColor"
        />
      </svg>
      <div className="absolute flex flex-col items-center gap-0.5">
        <span className={`flex items-center gap-1 text-lg font-bold ${ringColor}`}>
          <Flame className="h-4 w-4 fill-current" />
          {habit.streak}
        </span>
        <span className="text-[10px] text-muted">дней подряд</span>
      </div>
    </div>
  );
}

function HabitCard({ habit, onClick }: { habit: HabitItem; onClick: () => void }) {
  const Icon = habit.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`glass flex flex-col items-center gap-3 rounded-2xl px-4 py-5 text-center transition-colors ${
        habit.isBest ? "border-gold/70 shadow-[0_0_24px_-6px_rgba(212,175,55,0.55)]" : ""
      }`}
    >
      <span
        className={`glass-chip flex h-11 w-11 items-center justify-center rounded-full ${
          habit.isNegative ? "bg-danger/15 text-danger" : "bg-white/10 text-fg"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>

      <span className="text-sm font-semibold text-fg">{habit.title}</span>

      <HabitRing habit={habit} />

      <div className="flex items-center gap-2">
        {habit.week.map((status, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-muted">{WEEKDAY_LABELS[i]}</span>
            <span
              className={`h-2 w-2 rounded-full ${
                status === "done"
                  ? "bg-gold"
                  : status === "broken"
                    ? "bg-danger"
                    : "border border-white/25 bg-white/5"
              }`}
            />
          </div>
        ))}
      </div>

      {habit.isBest && (
        <span className="glass-chip flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
          <Flame className="h-3.5 w-3.5 fill-current" />
          Самый длинный стрик
        </span>
      )}
    </button>
  );
}

export function HabitsScreen() {
  const [habits] = useState(HABITS);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-5 pb-28">
      <div className="flex items-center justify-between pt-8">
        <button type="button" aria-label="Фильтры" className="glass-soft rounded-full p-2 text-fg">
          <ListFilter className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-fg">Привычки</h1>
        <button type="button" aria-label="Ещё" className="glass-soft rounded-full p-2 text-fg">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} onClick={() => {}} />
        ))}
      </div>

      <button
        type="button"
        className="glass-soft flex items-center justify-center gap-2 rounded-full border-gold/60 bg-gold/10 px-4 py-3.5 text-sm font-semibold text-gold transition-transform active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Добавить привычку
      </button>
    </div>
  );
}
