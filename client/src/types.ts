export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  /** Calendar day, "YYYY-MM-DD" */
  dueDate: string;
  /** 24h clock, "HH:mm" */
  startTime: string;
  /** 24h clock, "HH:mm" or "" */
  endTime: string;
  completed: boolean;
  completedAt: string | null;
  /** Monday of the task's week, "YYYY-MM-DD" */
  weekStart: string;
  createdAt: string;
  updatedAt: string;
}

/** What the create/edit form sends to the API. */
export interface TaskInput {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  startTime: string;
  endTime: string;
}

/** A week with its tasks and the numbers shown on the week card. */
export interface WeekBucket {
  weekStart: string;
  weekEnd: string;
  tasks: Task[];
  total: number;
  open: number;
  completed: number;
  progress: number;
}
