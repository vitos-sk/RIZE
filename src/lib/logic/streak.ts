export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

function previousDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function updateStreakOnCompletion(state: StreakState, today: string): StreakState {
  if (state.lastActiveDate === today) return state;

  const currentStreak = state.lastActiveDate === previousDate(today) ? state.currentStreak + 1 : 1;

  return {
    currentStreak,
    longestStreak: Math.max(state.longestStreak, currentStreak),
    lastActiveDate: today,
  };
}
