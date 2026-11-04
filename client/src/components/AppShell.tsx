import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { House, ListChecks, Plus } from 'lucide-react';
import { Brand } from './Brand';
import { ProgressBar } from './ProgressBar';
import { cn } from '../lib/cn';
import { dateKey, endOfWeek, formatWeekRange, startOfWeek } from '../lib/date';
import { tasksForWeek } from '../lib/week';
import { useTasks } from '../context/TasksContext';
import { useTaskModal } from '../context/TaskModalContext';

const ONBOARDING_KEY = 'taskly:onboarded';

export const hasOnboarded = () => {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch {
    return true;
  }
};

export const markOnboarded = () => {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // Private mode: the tour simply shows again next visit.
  }
};

const navItems = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/tasks', label: 'All Tasks', icon: ListChecks, end: false },
];

export function AppShell() {
  if (!hasOnboarded()) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-[100dvh] bg-surface/60">
      <Sidebar />

      <div className="lg:pl-[272px]">
        <main className="mx-auto w-full max-w-[620px] px-5 pb-28 pt-5 sm:px-6 lg:max-w-[1120px] lg:px-10 lg:pb-14 lg:pt-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  const { tasks } = useTasks();
  const { openCreateTask } = useTaskModal();

  const currentWeek = startOfWeek();
  const weekTasks = tasksForWeek(tasks, currentWeek);
  const completed = weekTasks.filter((task) => task.completed).length;
  const progress = weekTasks.length === 0 ? 0 : completed / weekTasks.length;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col border-r border-line bg-white px-5 py-7 lg:flex">
      <Brand />

      <nav aria-label="Main" className="mt-9 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition',
                isActive
                  ? 'bg-brand-50 text-brand'
                  : 'text-ink/60 hover:bg-surface hover:text-ink'
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <p className="mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
        This week
      </p>

      <div className="mt-3 rounded-2xl bg-surface p-4">
        <p className="text-[12px] font-semibold text-ink">
          {formatWeekRange(currentWeek, endOfWeek(currentWeek))}
        </p>
        <p className="mt-1 text-[11px] text-muted">
          {completed} of {weekTasks.length} completed
        </p>
        <ProgressBar value={progress} className="mt-3" />
      </div>

      <button
        type="button"
        onClick={() => openCreateTask(dateKey())}
        className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-brand text-[13px] font-semibold text-white shadow-fab transition hover:bg-brand-600 active:scale-[0.99]"
      >
        <Plus size={17} />
        Add new task
      </button>

      <div className="mt-auto rounded-2xl border border-dashed border-line px-4 py-3">
        <p className="text-[11px] font-semibold text-ink">Tip</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          Swipe a task left to delete it, or click the checkbox to mark it complete.
        </p>
      </div>
    </aside>
  );
}
