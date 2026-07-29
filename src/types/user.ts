export interface FokusUser {
  uid: string;
  displayName: string;
  createdAt: number;
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  gold: number;
}
