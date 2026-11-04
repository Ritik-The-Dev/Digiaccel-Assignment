import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CloudOff, ListChecks, RotateCw, SearchX } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { FloatingAddButton } from '../components/FloatingAddButton';
import { ProgressBar } from '../components/ProgressBar';
import { SearchField } from '../components/SearchField';
import { TaskListSkeleton } from '../components/TaskListSkeleton';
import { TaskRow } from '../components/TaskRow';
import { cn } from '../lib/cn';
import { dateKey, formatWeekRange, startOfWeek, weekNumber } from '../lib/date';
import { groupTasksByWeek } from '../lib/week';
import { useTasks } from '../context/TasksContext';
import { useTaskModal } from '../context/TaskModalContext';
import type { Task } from '../types';

type Filter = 'all' | 'open' | 'completed';

const filters: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

export function AllTasks() {
  const navigate = useNavigate();
  const { tasks, loading, error, refresh, toggleTask, deleteTask } = useTasks();
  const { openCreateTask, openEditTask } = useTaskModal();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return tasks.filter((task) => {
      if (filter === 'open' && task.completed) return false;
      if (filter === 'completed' && !task.completed) return false;
      if (!needle) return true;
      return (
        task.title.toLowerCase().includes(needle) ||
        task.description.toLowerCase().includes(needle)
      );
    });
  }, [tasks, filter, query]);

  const weeks = useMemo(() => groupTasksByWeek(filtered), [filtered]);
  const currentWeek = startOfWeek();

  const rows = (items: Task[]) => (
    <ul className="px-4">
      {items.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          showMeta
          showDate
          onToggle={(item) => void toggleTask(item)}
          onEdit={openEditTask}
          onDelete={(item) => void deleteTask(item)}
        />
      ))}
    </ul>
  );

  return (
    <>
      <header className="mb-4 flex items-center gap-3 lg:mb-7">
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Back to home"
          className="icon-button -ml-1.5 shrink-0"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[19px] font-semibold leading-tight text-ink lg:text-[24px]">
            All Tasks
          </h1>
          <p className="text-[11.5px] text-muted">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} across{' '}
            {groupTasksByWeek(tasks).length} {groupTasksByWeek(tasks).length === 1 ? 'week' : 'weeks'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCreateTask(dateKey())}
          className="hidden h-10 items-center gap-1.5 rounded-xl bg-brand px-4 text-[12.5px] font-semibold text-white shadow-fab transition hover:bg-brand-600 lg:flex"
        >
          New task
        </button>
      </header>

      <div className="mb-4 space-y-3 lg:mb-6 lg:flex lg:items-center lg:justify-between lg:gap-4 lg:space-y-0">
        <SearchField value={query} onChange={setQuery} className="lg:max-w-[360px]" />

        <div
          role="tablist"
          aria-label="Filter tasks"
          className="flex items-center gap-1 rounded-xl bg-surface p-1"
        >
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={filter === option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                'flex-1 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition lg:flex-none',
                filter === option.value
                  ? 'bg-white text-brand shadow-[0_2px_8px_rgba(19,26,46,0.08)]'
                  : 'text-muted hover:text-ink'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <EmptyState
          icon={<CloudOff size={20} />}
          title="Cannot reach the API"
          description={error}
          action={
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[12px] font-semibold text-white transition hover:bg-brand-600"
            >
              <RotateCw size={13} />
              Try again
            </button>
          }
        />
      ) : loading ? (
        <div className="rounded-2xl border border-line bg-white px-4 shadow-card">
          <TaskListSkeleton rows={5} />
        </div>
      ) : weeks.length === 0 ? (
        <EmptyState
          icon={query ? <SearchX size={20} /> : <ListChecks size={20} />}
          title={query ? 'No tasks match your search' : 'No tasks here yet'}
          description={
            query
              ? 'Try another keyword, or switch the filter back to All.'
              : 'Create your first task and it will show up in its week.'
          }
          action={
            query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setFilter('all');
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3.5 text-[12px] font-semibold text-ink transition hover:bg-surface"
              >
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openCreateTask(dateKey())}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[12px] font-semibold text-white transition hover:bg-brand-600"
              >
                Add task
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {weeks.map((bucket) => {
            const isCurrent = bucket.weekStart === currentWeek;

            return (
              <section
                key={bucket.weekStart}
                className={cn(
                  'overflow-hidden rounded-2xl border bg-white shadow-card',
                  isCurrent ? 'border-brand/25' : 'border-line'
                )}
              >
                <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
                  <span
                    className={cn(
                      'grid h-8 w-8 place-items-center rounded-lg',
                      isCurrent ? 'bg-brand text-white' : 'bg-brand-50 text-brand'
                    )}
                  >
                    <CalendarDays size={15} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
                      Week {weekNumber(bucket.weekStart)}
                      {isCurrent && (
                        <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand">
                          Now
                        </span>
                      )}
                    </p>
                    <p className="text-[10.5px] text-muted">
                      {formatWeekRange(bucket.weekStart, bucket.weekEnd)} · {bucket.total}{' '}
                      {bucket.total === 1 ? 'task' : 'tasks'}
                    </p>
                  </div>

                  <span className="rounded-md bg-surface px-2 py-1 text-[10px] font-semibold text-muted">
                    {bucket.open} open · {bucket.completed} done
                  </span>
                </div>

                <div className="px-4 pt-3">
                  <ProgressBar
                    value={bucket.progress}
                    label={`Week ${weekNumber(bucket.weekStart)} progress`}
                    className="h-1.5"
                  />
                </div>

                {rows(bucket.tasks)}
              </section>
            );
          })}
        </div>
      )}

      <FloatingAddButton onClick={() => openCreateTask(dateKey())} />
    </>
  );
}
