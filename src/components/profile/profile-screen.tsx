"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Pencil, Smartphone } from "lucide-react";
import { ProfileHero } from "@/components/profile/profile-hero";
import { LifetimeSummary } from "@/components/profile/lifetime-summary";
import { YearHeatmap } from "@/components/profile/year-heatmap";
import { WeekdayProfile } from "@/components/profile/weekday-profile";
import { PeakHoursCard } from "@/components/profile/peak-hours-card";
import { TaskReliabilityCard } from "@/components/profile/task-reliability-card";
import { StatsGrid } from "@/components/profile/stats-grid";
import { AccountCard } from "@/components/profile/account-card";
import { EditProfileSheet } from "@/components/profile/edit-profile-sheet";
import { InstallGuideSheet } from "@/components/profile/install-guide-sheet";
import { sendPasswordReset, signOutUser, updateDisplayName } from "@/lib/firebase/auth";
import { updateUserDoc } from "@/lib/firebase/users";
import { buildProfileInsights } from "@/lib/logic/profile";
import type { KaiznUser } from "@/types/user";
import type { Task } from "@/types/task";
import type { Log } from "@/types/log";

interface ProfileScreenProps {
  uid: string;
  email: string;
  fallbackName: string;
  user: KaiznUser | null;
  tasks: Task[];
  logs: Log[];
}

export function ProfileScreen({ uid, email, fallbackName, user, tasks, logs }: ProfileScreenProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);

  const insights = useMemo(() => buildProfileInsights(user, logs, tasks), [user, logs, tasks]);

  const displayName = user?.displayName?.trim() || fallbackName;

  // Имя живёт и в Auth-профиле, и в документе users/{uid} — иначе они разъедутся.
  async function handleSaveName(nextName: string) {
    await Promise.all([updateDisplayName(nextName), updateUserDoc(uid, { displayName: nextName })]);
  }

  return (
    <div className="paper-canvas relative flex h-full flex-col">
      <div className="mx-auto flex w-full max-w-md min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-7 pb-32">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-hand text-[2.6rem] leading-none font-bold text-ink">Профиль</h1>
            <p className="mt-1.5 font-note text-sm text-ink-soft">Как ты работаешь на самом деле</p>
          </div>

          <button type="button" onClick={() => setSheetOpen(true)} className="paper-sheet mt-1 shrink-0">
            <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
            <span className="relative flex items-center gap-2 px-4 py-2 font-note text-sm text-ink">
              <Pencil className="h-4 w-4 text-ink-soft" strokeWidth={2} />
              Изменить
            </span>
          </button>
        </header>

        {/* Памятка по установке видна всегда — приложение не проверяет,
            запущено ли оно с главного экрана. */}
        <button
          type="button"
          onClick={() => setInstallOpen(true)}
          className="paper-sheet -mt-2 self-start transition-transform active:scale-[0.97]"
        >
          <span className="paper-chip-bg absolute inset-0" aria-hidden="true" />
          <span className="relative flex items-center gap-1.5 px-2.5 py-1.5 font-note text-xs text-ink">
            <Smartphone className="h-3.5 w-3.5 text-ink-soft" strokeWidth={2} />
            Установить на телефон
            <ChevronRight className="h-3.5 w-3.5 text-ink-soft" strokeWidth={2} />
          </span>
        </button>

        <ProfileHero
          displayName={displayName}
          email={email}
          memberSince={insights.memberSince}
          currentStreak={insights.totals.streak}
          ratePercent={insights.totals.rate}
        />

        <LifetimeSummary insights={insights} />

        <div className="flex flex-col gap-3">
          <h2 className="font-hand text-2xl leading-none font-bold text-ink">Как ты работаешь</h2>
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

        <p className="text-center font-note text-xs text-ink-soft">
          {insights.daysSinceStart} дн. в Kaizn · {insights.totals.done} выполнений
        </p>
      </div>

      {sheetOpen && (
        <EditProfileSheet
          initialName={displayName}
          onClose={() => setSheetOpen(false)}
          onSave={handleSaveName}
        />
      )}

      {installOpen && <InstallGuideSheet onClose={() => setInstallOpen(false)} />}
    </div>
  );
}
