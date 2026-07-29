"use client";

import { Pencil } from "lucide-react";
import { ProfileHero } from "@/components/profile/profile-hero";
import { LevelCard } from "@/components/profile/level-card";
import { StatsGrid } from "@/components/profile/stats-grid";
import { AchievementsRow, SAMPLE_ACHIEVEMENTS } from "@/components/profile/achievements-row";
import { signOutUser } from "@/lib/firebase/auth";

export default function ProfilePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-5 pb-4">
      <div className="flex items-center justify-between pt-4">
        <h1 className="text-2xl font-bold text-fg">Профиль</h1>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-fg"
        >
          <Pencil className="h-4 w-4" />
          Изменить
        </button>
      </div>

      <ProfileHero
        displayName="Виталий"
        handle="@vitalii.rize"
        memberSince="март 2025"
        level={7}
      />

      <LevelCard level={7} nextLevel={8} xp={3420} xpToNextLevel={1580} />

      <StatsGrid
        totalXP={3420}
        tasksDone={247}
        bestStreak={21}
        longestFocus="4h"
        goldCoins={890}
        habitsKeptPct={89}
      />

      <AchievementsRow earnedCount={12} achievements={SAMPLE_ACHIEVEMENTS} />

      <button
        type="button"
        onClick={() => signOutUser()}
        className="rounded-2xl border border-border bg-card py-3.5 text-center text-sm font-medium text-danger"
      >
        Выйти
      </button>
    </div>
  );
}
