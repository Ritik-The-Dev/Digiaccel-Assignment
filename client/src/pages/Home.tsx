import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CloudOff,
  Clock3,
  Loader2,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { FloatingAddButton } from '../components/FloatingAddButton';
import { ProgressBar } from '../components/ProgressBar';
import { SearchField } from '../components/SearchField';
import { StatCard } from '../components/StatCard';
import { TaskListSkeleton } from '../components/TaskListSkeleton';
import { TaskRow } from '../components/TaskRow';
import { WeekCard } from '../components/WeekCard';
import { WeekStrip } from '../components/WeekStrip';
import { useTasks } from '../context/TasksContext';
import { useTaskModal } from '../context/TaskModalContext';
import {
  addDays,
  dateKey,
  diffInDays,
  formatLongDate,
  isToday,
  relativeDayLabel,
  startOfWeek,
} from '../lib/date';
import { groupTasksByWeek, tasksForDay, tasksForWeek } from '../lib/week';

export function Home() {
  const { tasks, loading, error, refresh, toggleTask, deleteTask } = useTasks();
  const { openCreateTask, openEditTask } = useTaskModal();

  const [selectedDay, setSelectedDay] = useState(() => dateKey());
  const [query, setQuery] = useState('');
  // Collapsed on phones (the day list already shows those tasks); open on desktop,
  // where the week cards live in their own column.
  const [expandedWeek, setExpandedWeek] = useState<string | null>(() =>
    window.matchMedia('(min-width: 1024px)').matches ? startOfWeek() : null
  );

  const currentWeek = startOfWeek();

  /** Stats and progress always describe the current week, like the design. */
  const weekTasks = useMemo(() => tasksForWeek(tasks, currentWeek), [tasks, currentWeek]);
  const completedThisWeek = weekTasks.filter((task) => task.completed).length;
  const pendingThisWeek = weekTasks.length - completedThisWeek;
  const weekProgress = weekTasks.length === 0 ? 0 : completedThisWeek / weekTasks.length;

  const dayTasks = useMemo(() => tasksForDay(tasks, selectedDay), [tasks, selectedDay]);
  const visibleTasks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return dayTasks;
    return dayTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(needle) ||
        task.description.toLowerCase().includes(needle)
    );
  }, [dayTasks, query]);

  const weeks = useMemo(() => groupTasksByWeek(tasks), [tasks]);
  const doneToday = dayTasks.filter((task) => task.completed).length;

  /** Moving between weeks keeps the same weekday selected. */
  const handleChangeWeek = (nextWeekStart: string) => {
    const offset = diffInDays(startOfWeek(selectedDay), selectedDay);
    setSelectedDay(addDays(nextWeekStart, offset));
  };

  return (
    <>
      <header className="mb-4 hidden items-start justify-between gap-6 lg:mb-7 lg:flex">
        <div>
          <h1 className="font-display text-[24px] font-semibold leading-tight text-ink">
            {isToday(selectedDay) ? 'Overview' : relativeDayLabel(selectedDay)}
          </h1>
          <p className="mt-1 text-[12.5px] text-muted">
            {formatLongDate(selectedDay)} · {doneToday} of {dayTasks.length} tasks done
          </p>
        </div>

        <div className="w-[320px] shrink-0">
          <SearchField value={query} onChange={setQuery} />
        </div>
      </header>

      <div className="space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6 lg:space-y-0">
        <div className="space-y-5 lg:space-y-6">
          <div className="lg:hidden">
            <SearchField value={query} onChange={setQuery} />
          </div>

          <WeekStrip
            weekStart={startOfWeek(selectedDay)}
            selectedDay={selectedDay}
            tasks={tasks}
            onSelectDay={setSelectedDay}
            onChangeWeek={handleChangeWeek}
            onToday={() => setSelectedDay(dateKey())}
          />

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
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Task Complete"
                  value={completedThisWeek}
                  tone="blue"
                  icon={<CheckCircle2 size={16} />}
                />
                <StatCard
                  label="Task Pending"
                  value={pendingThisWeek}
                  tone="red"
                  icon={<Clock3 size={16} />}
                />
              </div>

              <section className="rounded-2xl border border-line bg-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[13.5px] font-semibold text-ink">Weekly Progress</h2>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {completedThisWeek} of {weekTasks.length} tasks completed this week
                    </p>
                  </div>
                  <span className="font-display text-[19px] font-semibold leading-none text-brand">
                    {Math.round(weekProgress * 100)}%
                  </span>
                </div>

                <ProgressBar value={weekProgress} className="mt-3.5 h-2.5" />

                <div className="mt-3 flex items-center justify-between text-[10.5px] font-medium text-muted">
                  <span>Mon</span>
                  <span className="capitalize">
                    {weekTasks.length === 0
                      ? 'No tasks yet'
                      : `${pendingThisWeek} task${pendingThisWeek === 1 ? '' : 's'} left`}
                  </span>
                  <span>Sun</span>
                </div>
              </section>

              <section className="rounded-2xl border border-line bg-white shadow-card">
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[14px] font-semibold text-ink">
                      {isToday(selectedDay) ? 'Tasks Today' : 'Tasks'}
                    </h2>
                    {dayTasks.length > 0 && (
                      <span className="rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  <Link
                    to="/tasks"
                    className="flex items-center gap-0.5 text-[11.5px] font-semibold text-brand transition hover:text-brand-700"
                  >
                    View All
                    <ChevronRight size={13} />
                  </Link>
                </div>

                {loading ? (
                  <div className="px-4">
                    <TaskListSkeleton rows={3} />
                  </div>
                ) : !isToday(selectedDay) && (
                  <p className="border-b border-line px-4 py-2 text-[11px] text-muted">
                    {relativeDayLabel(selectedDay)}
                  </p>
                )}

                {!loading && visibleTasks.length === 0 ? (
                  <EmptyState
                    className="m-4 border-0 bg-transparent py-8"
                    icon={query ? <Sparkles size={20} /> : <CalendarCheck2 size={20} />}
                    title={query ? 'No matching tasks' : 'Nothing planned yet'}
                    description={
                      query
                        ? 'Try a different keyword or clear the search.'
                        : `Add your first task for ${isToday(selectedDay) ? 'today' : relativeDayLabel(selectedDay).toLowerCase()}.`
                    }
                    action={
                      !query && (
                        <button
                          type="button"
                          onClick={() => openCreateTask(selectedDay)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[12px] font-semibold text-white transition hover:bg-brand-600"
                        >
                          Add task
                        </button>
                      )
                    }
                  />
                ) : (
                  <ul className="px-4">
                    {loading
                      ? null
                      : visibleTasks.map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            showMeta
                            onToggle={(item) => void toggleTask(item)}
                            onEdit={openEditTask}
                            onDelete={(item) => void deleteTask(item)}
                          />
                        ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>

        {/* Right rail on desktop, bottom section on mobile */}
        <div className="space-y-3 lg:sticky lg:top-9">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
              <CalendarDays size={14} className="text-brand" />
              Your weeks
            </h2>
            <span className="text-[11px] text-muted">
              {weeks.length} {weeks.length === 1 ? 'week' : 'weeks'}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-6 text-[12px] text-muted">
              <Loader2 size={15} className="animate-spin text-brand" />
              Loading your weeks…
            </div>
          ) : weeks.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={20} />}
              title="No weeks yet"
              description="Tasks are grouped Monday to Sunday as soon as you create them."
            />
          ) : (
            weeks.map((bucket) => (
              <WeekCard
                key={bucket.weekStart}
                bucket={bucket}
                expanded={expandedWeek === bucket.weekStart}
                onToggleExpanded={() =>
                  setExpandedWeek((current) => (current === bucket.weekStart ? null : bucket.weekStart))
                }
                onToggleTask={(task) => void toggleTask(task)}
                onEditTask={openEditTask}
                onDeleteTask={(task) => void deleteTask(task)}
              />
            ))
          )}
        </div>
      </div>

      <FloatingAddButton onClick={() => openCreateTask(selectedDay)} />
    </>
  );
}
