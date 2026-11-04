import type { Task, WeekBucket } from '../types';
import { diffInDays, endOfWeek, startOfWeek } from './date';

/**
 * Groups tasks by their Monday-to-Sunday week.
 *
 * The bucket is derived from `dueDate` rather than trusting the API field, so
 * the UI stays correct even for optimistically created tasks.
 */
export function groupTasksByWeek(tasks: Task[]): WeekBucket[] {
  const buckets = new Map<string, Task[]>();

  for (const task of tasks) {
    const weekStart = startOfWeek(task.dueDate);
    const existing = buckets.get(weekStart);
    if (existing) existing.push(task);
    else buckets.set(weekStart, [task]);
  }

  const currentWeek = startOfWeek();

  return Array.from(buckets, ([weekStart, weekTasks]) => {
    const completed = weekTasks.filter((task) => task.completed).length;
    const total = weekTasks.length;
    return {
      weekStart,
      weekEnd: endOfWeek(weekStart),
      tasks: [...weekTasks].sort(
        (a, b) =>
          a.dueDate.localeCompare(b.dueDate) || a.startTime.localeCompare(b.startTime)
      ),
      total,
      completed,
      open: total - completed,
      progress: total === 0 ? 0 : completed / total,
    };
  }).sort((a, b) => {
    // Current week first, then the closest weeks around it.
    const distanceA = Math.abs(diffInDays(currentWeek, a.weekStart));
    const distanceB = Math.abs(diffInDays(currentWeek, b.weekStart));
    if (distanceA !== distanceB) return distanceA - distanceB;
    return a.weekStart < b.weekStart ? 1 : -1;
  });
}

/** Tasks for one week, sorted by day then start time. */
export function tasksForWeek(tasks: Task[], weekStart: string): Task[] {
  return tasks
    .filter((task) => startOfWeek(task.dueDate) === weekStart)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.startTime.localeCompare(b.startTime));
}

/** Tasks for a single calendar day, sorted by start time. */
export function tasksForDay(tasks: Task[], day: string): Task[] {
  return tasks
    .filter((task) => task.dueDate === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}
