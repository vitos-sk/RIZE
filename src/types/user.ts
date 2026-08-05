export interface FokusUser {
  uid: string;
  displayName: string;
  createdAt: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  /** Дефолтные категории засеяны — чтобы удалённые не возвращались при следующем входе. */
  categoriesSeeded?: boolean;
}
