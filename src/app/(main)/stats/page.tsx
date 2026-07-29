"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { PeriodTabs, type Period } from "@/components/stats/period-tabs";
import { ScoreComparisonCard } from "@/components/stats/score-comparison-card";
import { TasksScoreChart, type ChartPoint } from "@/components/stats/tasks-score-chart";
import { DayHighlightCards } from "@/components/stats/day-highlight-cards";
import { CategoryCompletion } from "@/components/stats/category-completion";

interface PeriodData {
  chart: ChartPoint[];
  todayLabel?: string;
  comparisonLabel: string;
  changePercent: number;
  rangeLabel: string;
  currentScore: number;
  best: { label: string; xp: number; tasksDone: number; score: number };
  worst: { label: string; xp: number; tasksDone: number; score: number };
  categoryPeriodLabel: string;
  categories: { category: string; done: number; total: number }[];
}

const PERIOD_DATA: Record<Period, PeriodData> = {
  day: {
    chart: [
      { label: "6:00", tasksDone: 1, score: 20, prevScore: 15 },
      { label: "9:00", tasksDone: 3, score: 55, prevScore: 40 },
      { label: "12:00", tasksDone: 2, score: 45, prevScore: 50 },
      { label: "15:00", tasksDone: 4, score: 78, prevScore: 60 },
      { label: "18:00", tasksDone: 2, score: 38, prevScore: 45 },
      { label: "21:00", tasksDone: 3, score: 62, prevScore: 55 },
    ],
    todayLabel: "21:00",
    comparisonLabel: "Вчера",
    changePercent: 12,
    rangeLabel: "28 июля · сегодня",
    currentScore: 298,
    best: { label: "15:00", xp: 62, tasksDone: 4, score: 78 },
    worst: { label: "12:00", xp: -10, tasksDone: 2, score: 45 },
    categoryPeriodLabel: "сегодня",
    categories: [
      { category: "Работа", done: 3, total: 4 },
      { category: "Спорт", done: 1, total: 1 },
      { category: "Учёба", done: 2, total: 3 },
    ],
  },
  week: {
    chart: [
      { label: "Пн", tasksDone: 5, score: 60, prevScore: 58 },
      { label: "Вт", tasksDone: 6, score: 68, prevScore: 62 },
      { label: "Ср", tasksDone: 4, score: 58, prevScore: 64 },
      { label: "Чт", tasksDone: 9, score: 95, prevScore: 72 },
      { label: "Пт", tasksDone: 6, score: 66, prevScore: 60 },
      { label: "Сб", tasksDone: 5, score: 60, prevScore: 60 },
      { label: "Вс", tasksDone: 7, score: 82, prevScore: 66 },
    ],
    todayLabel: "Вс",
    comparisonLabel: "Пред. нед.",
    changePercent: 18,
    rangeLabel: "20 – 26 июля · окно 7 дней",
    currentScore: 1247,
    best: { label: "Четверг", xp: 145, tasksDone: 9, score: 95 },
    worst: { label: "Среда", xp: -30, tasksDone: 4, score: 58 },
    categoryPeriodLabel: "на этой неделе",
    categories: [
      { category: "Работа", done: 18, total: 22 },
      { category: "Спорт", done: 8, total: 12 },
      { category: "Учёба", done: 10, total: 11 },
    ],
  },
  month: {
    chart: [
      { label: "Н1", tasksDone: 24, score: 65, prevScore: 60 },
      { label: "Н2", tasksDone: 31, score: 74, prevScore: 66 },
      { label: "Н3", tasksDone: 19, score: 52, prevScore: 68 },
      { label: "Н4", tasksDone: 33, score: 88, prevScore: 70 },
    ],
    todayLabel: "Н4",
    comparisonLabel: "Пред. мес.",
    changePercent: 9,
    rangeLabel: "1 – 28 июля · окно 4 недели",
    currentScore: 4620,
    best: { label: "Неделя 4", xp: 410, tasksDone: 33, score: 88 },
    worst: { label: "Неделя 3", xp: -60, tasksDone: 19, score: 52 },
    categoryPeriodLabel: "в этом месяце",
    categories: [
      { category: "Работа", done: 64, total: 80 },
      { category: "Спорт", done: 29, total: 40 },
      { category: "Учёба", done: 35, total: 38 },
    ],
  },
};

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>("week");
  const data = PERIOD_DATA[period];

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-5 pt-6 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-fg">Статистика</h1>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-fg"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Фильтр
        </button>
      </div>

      <PeriodTabs value={period} onChange={setPeriod} />

      <ScoreComparisonCard
        changePercent={data.changePercent}
        rangeLabel={data.rangeLabel}
        windowLabel={period}
        currentScore={data.currentScore}
      />

      <TasksScoreChart data={data.chart} todayLabel={data.todayLabel} comparisonLabel={data.comparisonLabel} />

      <DayHighlightCards best={data.best} worst={data.worst} />

      <CategoryCompletion periodLabel={data.categoryPeriodLabel} categories={data.categories} />
    </div>
  );
}
