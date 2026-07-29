export interface Goal {
  id: string;
  title: string;
  target: number;
  progress: number;
  deadline: string | null;
  linkedTaskIds: string[];
  createdAt: number;
}
