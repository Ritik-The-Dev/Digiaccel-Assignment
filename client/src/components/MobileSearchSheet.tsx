import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CalendarDays, Check, Search, Sparkles, X } from 'lucide-react';
import { cn } from '../lib/cn';
import { formatShortDate, formatTimeRange, isToday, relativeDayLabel } from '../lib/date';
import type { Task } from '../types';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

const priorityStyles: Record<Task['priority'], string> = {
  low: 'bg-emerald-50 text-emerald-600',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-rose-50 text-rose-600',
};

interface MobileSearchSheetProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  /** Called when the user taps a date chip — closes the sheet and jumps to that day. */
  onGoToDate: (dateKey: string) => void;
}

export function MobileSearchSheet({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onGoToDate,
}: MobileSearchSheetProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when sheet opens
  useEffect(() => {
    if (open) {
      // Small delay so the transition has started before keyboard appears
      const id = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(id);
    } else {
      setQuery('');
    }
  }, [open]);

  // Lock body scroll while sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const needle = query.trim().toLowerCase();
  const results = needle
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(needle) ||
          t.description.toLowerCase().includes(needle)
      )
    : [];

  return (
    <>
      {/* Trigger — looks like the regular SearchField but opens the sheet */}
      <button
        type="button"
        aria-label="Open search"
        onClick={() => setOpen(true)}
        className="relative flex h-11 w-full items-center gap-3 rounded-xl border border-line bg-white px-4 text-[14px] text-muted/80 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/10"
      >
        <Search size={17} className="shrink-0 text-muted" />
        <span className="flex-1 text-left">Search for a task</span>
      </button>

      {/* Overlay */}
      <div
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-50 bg-black/30 transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setOpen(false)}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search tasks"
        className={cn(
          'fixed inset-x-0 top-0 z-50 flex h-[100dvh] flex-col bg-white transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close search"
            className="icon-button -ml-1 shrink-0"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a task…"
              aria-label="Search tasks"
              className="h-11 w-full rounded-xl border border-line bg-surface pl-4 pr-10 text-[14px] text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-white hover:text-ink"
              >
                <X size={15} />
              </button>
            ) : (
              <Search
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {!needle ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Search size={28} className="text-muted/40" />
              <p className="text-[13px] font-medium text-ink">Search all your tasks</p>
              <p className="text-[11.5px] text-muted">Type a keyword to find tasks by title or description.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Sparkles size={28} className="text-muted/40" />
              <p className="text-[13px] font-medium text-ink">No matching tasks</p>
              <p className="text-[11.5px] text-muted">Try a different keyword or clear the search.</p>
            </div>
          ) : (
            <>
              <p className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {results.length} result{results.length === 1 ? '' : 's'}
              </p>
              <ul className="px-4">
                {results.map((task) => (
                  <SearchResultRow
                    key={task.id}
                    task={task}
                    query={needle}
                    onToggle={() => { onToggle(task); }}
                    onEdit={() => { onEdit(task); setOpen(false); }}
                    onDelete={() => setPendingDelete(task)}
                    onGoToDate={(dateKey) => { setOpen(false); onGoToDate(dateKey); }}
                  />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {pendingDelete && (
        <ConfirmDeleteDialog
          taskTitle={pendingDelete.title}
          onConfirm={() => { onDelete(pendingDelete); setPendingDelete(null); }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}

// ── Individual result row ────────────────────────────────────────────────────

interface SearchResultRowProps {
  task: Task;
  query: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onGoToDate: (dateKey: string) => void;
}

function SearchResultRow({ task, query, onToggle, onEdit, onDelete, onGoToDate }: SearchResultRowProps) {
  return (
    <li className="border-b border-line last:border-0">
      <div className="flex items-center gap-3 py-3.5">
        {/* Checkbox */}
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={task.completed}
          aria-label={task.completed ? `Mark "${task.title}" as open` : `Mark "${task.title}" as complete`}
          className={cn(
            'grid h-[21px] w-[21px] shrink-0 place-items-center rounded-[6px] border-[1.5px] transition',
            task.completed
              ? 'border-brand bg-brand text-white'
              : 'border-ink/20 bg-white text-transparent hover:border-brand/60'
          )}
        >
          <Check size={13} strokeWidth={3.5} />
        </button>

        {/* Text — tapping opens edit */}
        <button
          type="button"
          onClick={onEdit}
          className="min-w-0 flex-1 text-left"
        >
          <p
            className={cn(
              'text-[13.5px] font-medium leading-snug text-ink',
              task.completed && 'text-muted line-through'
            )}
          >
            <Highlight text={task.title} needle={query} />
          </p>
          <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-muted">
            <span className="whitespace-nowrap tabular-nums">
              {formatTimeRange(task.startTime, task.endTime)}
            </span>
            <span
              className={cn(
                'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize',
                priorityStyles[task.priority]
              )}
            >
              {task.priority}
            </span>
          </span>
        </button>

        {/* Date chip — tap to jump to that day on the home screen */}
        <button
          type="button"
          onClick={() => onGoToDate(task.dueDate)}
          aria-label={`Go to ${formatShortDate(task.dueDate)}`}
          title={`View all tasks for ${relativeDayLabel(task.dueDate)}`}
          className={cn(
            'flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-[10.5px] font-semibold transition',
            isToday(task.dueDate)
              ? 'border-brand/30 bg-brand-50 text-brand hover:bg-brand hover:text-white'
              : 'border-line bg-surface text-muted hover:border-brand/30 hover:bg-brand-50 hover:text-brand'
          )}
        >
          <CalendarDays size={11} />
          {formatShortDate(task.dueDate)}
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${task.title}`}
          className="icon-button h-8 w-8 shrink-0 hover:text-danger"
        >
          <X size={15} />
        </button>
      </div>
    </li>
  );
}

// ── Keyword highlight helper ─────────────────────────────────────────────────

function Highlight({ text, needle }: { text: string; needle: string }) {
  const idx = text.toLowerCase().indexOf(needle);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-brand/15 text-brand not-italic">{text.slice(idx, idx + needle.length)}</mark>
      {text.slice(idx + needle.length)}
    </>
  );
}
