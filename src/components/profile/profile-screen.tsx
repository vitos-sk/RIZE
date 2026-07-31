"use client";

import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { ProfileHero } from "@/components/profile/profile-hero";
import { LifetimeSummary } from "@/components/profile/lifetime-summary";
import { YearHeatmap } from "@/components/profile/year-heatmap";
import { WeekdayProfile } from "@/components/profile/weekday-profile";
import { PeakHoursCard } from "@/components/profile/peak-hours-card";
import { TaskReliabilityCard } from "@/components/profile/task-reliability-card";
import { StatsGrid } from "@/components/profile/stats-grid";
import { AccountCard } from "@/components/profile/account-card";
import { EditProfileSheet } from "@/components/profile/edit-profile-sheet";
import { sendPasswordReset, signOutUser, updateDisplayName } from "@/lib/firebase/auth";
import { updateUserDoc } from "@/lib/firebase/users";
import { buildProfileInsights } from "@/lib/logic/profile";
import type { FokusUser } from "@/types/user";
import type { Task } from "@/types/task";
import type { Log } from "@/types/log";

interface ProfileScreenProps {
  uid: string;
  email: string;
  fallbackName: string;
  user: FokusUser | null;
  tasks: Task[];
  logs: Log[];
}

export function ProfileScreen({ uid, email, fallbackName, user, tasks, logs }: ProfileScreenProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const insights = useMemo(() => buildProfileInsights(user, logs, tasks), [user, logs, tasks]);

  const displayName = user?.displayName?.trim() || fallbackName;

  // Имя живёт и в Auth-профиле, и в документе users/{uid} — иначе они разъедутся.
  async function handleSaveName(nextName: string) {
    await Promise.all([updateDisplayName(nextName), updateUserDoc(uid, { displayName: nextName })]);
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 overflow-y-auto px-5 pb-28 pt-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-fg">Профиль</h1>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="glass-soft flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-white/8"
          >
            <Pencil className="h-4 w-4" />
            Изменить
          </button>
        </div>

        <ProfileHero
          displayName={displayName}
          email={email}
          memberSince={insights.memberSince}
          currentStreak={insights.totals.streak}
          ratePercent={insights.totals.rate}
        />

        <LifetimeSummary insights={insights} />

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-fg">Как ты работаешь</h2>
          <YearHeatmap heatmap={insights.heatmap} />
          <WeekdayProfile
            weekdays={insights.weekdays}
            best={insights.bestWeekday}
            worst={insights.worstWeekday}
          />
          <PeakHoursCard peak={insights.peak} />
          <TaskReliabilityCard strongest={insights.strongest} weakest={insights.weakest} />
        </div>

        <StatsGrid insights={insights} />

        <AccountCard
          email={email}
          onResetPassword={() => sendPasswordReset(email)}
          onSignOut={() => signOutUser()}
        />

        <p className="text-center text-xs text-muted">
          {insights.daysSinceStart} дн. в FokusTracker · {insights.totals.done} выполнений
        </p>
      </div>

      {sheetOpen && (
        <EditProfileSheet
          initialName={displayName}
          onClose={() => setSheetOpen(false)}
          onSave={handleSaveName}
        />
      )}
    </div>
  );
}
