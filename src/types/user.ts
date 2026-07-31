export interface FokusUser {
  uid: string;
  displayName: string;
  createdAt: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}
