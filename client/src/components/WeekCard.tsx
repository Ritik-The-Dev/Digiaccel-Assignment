import { CalendarDays, ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';
import { formatWeekRange, startOfWeek, weekNumber } from '../lib/date';
import type { Task, WeekBucket } from '../types';
import { ProgressBar } from './ProgressBar';
import { TaskRow } from './TaskRow';

interface WeekCardProps {
  bucket: WeekBucket;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function WeekCard({
  bucket,
  expanded,
  onToggleExpanded,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}: WeekCardProps) {
  const isCurrentWeek = bucket.weekStart === startOfWeek();

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border bg-white transition-shadow',
        isCurrentWeek ? 'border-brand/25 shadow-card' : 'border-line',
        expanded && 'shadow-card'
      )}
    >
      <button
        type="button"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <span
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
            isCurrentWeek ? 'bg-brand text-white' : 'bg-brand-50 text-brand'
          )}
        >
          <CalendarDays size={18} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="text-[13.5px] font-semibold text-ink">
              {isCurrentWeek ? 'This Week' : `Week ${weekNumber(bucket.weekStart)}`}
            </span>
            {isCurrentWeek && (
              <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand">
                Now
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-[11px] text-muted">
            {formatWeekRange(bucket.weekStart, bucket.weekEnd)} · {bucket.total}{' '}
            {bucket.total === 1 ? 'task' : 'tasks'}
          </span>
        </span>

        <ChevronDown
          size={18}
          className={cn('mt-1 shrink-0 text-muted transition-transform', expanded && 'rotate-180')}
        />
      </button>

      <div className="px-4 pb-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md bg-brand-50 px-2 py-1 text-[10px] font-semibold text-brand">
            {bucket.open} open
          </span>
          <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
            {bucket.completed} done
          </span>
          <span className="ml-auto text-[10px] font-medium tabular-nums text-muted">
            {Math.round(bucket.progress * 100)}%
          </span>
        </div>
        <ProgressBar value={bucket.progress} label={`${bucket.weekStart} week progress`} />
      </div>

      {expanded && (
        <div className="animate-fade-in border-t border-line px-4">
          <ul>
            {bucket.tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                showMeta
                onToggle={onToggleTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
