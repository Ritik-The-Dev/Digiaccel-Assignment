import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Check, Search, Sparkles, X } from 'lucide-react';
import { cn } from '../lib/cn';
import { formatShortDate, formatTimeRange, isToday, relativeDayLabel } from '../lib/date';
import type { Task } from '../types';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

const priorityStyles: Record<Task['priority'], string> = {
  low: 'bg-emerald-50 text-emerald-600',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-rose-50 text-rose-600',
};

interface SearchDropdownProps {
  /** The current search query — dropdown only shows when this is non-empty. */
  query: string;
  onChange: (value: string) => void;
  /** All tasks to search across (not just today's). */
  tasks: Task[];
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  /**
   * Called when the user clicks a result row or its date chip.
   * The parent should set selectedDay to `dateKey` and close the dropdown
   * by clearing the query.
   */
  onGoToDate: (dateKey: string) => void;
  /** Extra class for the wrapper div. */
  className?: string;
}

export function SearchDropdown({
  query,
  onChange,
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onGoToDate,
  className,
}: SearchDropdownProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);

  const needle = query.trim().toLowerCase();
  const open = needle.length > 0;

  const results = open
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(needle) ||
          t.description.toLowerCase().includes(needle)
      )
    : [];

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onChange('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onChange]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange('');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onChange]);

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      {/* Search input */}
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search for a task"
          aria-label="Search tasks"
          aria-expanded={open}
          aria-autocomplete="list"
          className="h-11 w-full rounded-xl border border-line bg-white pl-4 pr-11 text-[14px] text-ink outline-none transition placeholder:text-muted/80 focus:border-brand focus:ring-4 focus:ring-brand/10 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-ink"
          >
            <X size={15} />
          </button>
        ) : (
          <Search
            size={17}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
        )}
      </div>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[420px] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-white shadow-[0_8px_32px_rgba(19,26,46,0.12)]"
        >
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 py-10 text-center">
              <Sparkles size={22} className="text-muted/40" />
              <p className="text-[13px] font-medium text-ink">No matching tasks</p>
              <p className="text-[11.5px] text-muted">Try a different keyword.</p>
            </div>
          ) : (
            <>
              <p className="border-b border-line px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {results.length} result{results.length === 1 ? '' : 's'} across all dates
              </p>
              <ul>
                {results.map((task) => (
                  <DropdownResultRow
                    key={task.id}
                    task={task}
                    needle={needle}
                    onToggle={() => onToggle(task)}
                    onEdit={() => {
                      onEdit(task);
                      onChange('');
                    }}
                    onDelete={() => setPendingDelete(task)}
                    onGoToDate={() => {
                      onGoToDate(task.dueDate);
                      onChange('');
                    }}
                  />
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDeleteDialog
          taskTitle={pendingDelete.title}
          onConfirm={() => { onDelete(pendingDelete); setPendingDelete(null); }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

// ── Result row ───────────────────────────────────────────────────────────────

interface DropdownResultRowProps {
  task: Task;
  needle: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onGoToDate: () => void;
}

function DropdownResultRow({
  task,
  needle,
  onToggle,
  onEdit,
  onDelete,
  onGoToDate,
}: DropdownResultRowProps) {
  return (
    <li
      role="option"
      aria-selected={false}
      className="group border-b border-line last:border-0"
    >
      <div className="flex items-center gap-3 px-4 py-3 transition hover:bg-surface/60">
        {/* Checkbox */}
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={task.completed}
          aria-label={
            task.completed
              ? `Mark "${task.title}" as open`
              : `Mark "${task.title}" as complete`
          }
          className={cn(
            'grid h-[21px] w-[21px] shrink-0 place-items-center rounded-[6px] border-[1.5px] transition',
            task.completed
              ? 'border-brand bg-brand text-white'
              : 'border-ink/20 bg-white text-transparent hover:border-brand/60'
          )}
        >
          <Check size={13} strokeWidth={3.5} />
        </button>

        {/* Title + meta — clicking jumps to that date */}
        <button
          type="button"
          onClick={onEdit}
          className="min-w-0 flex-1 text-left"
        >
          <p
            className={cn(
              'truncate text-[13.5px] font-medium leading-snug text-ink',
              task.completed && 'text-muted line-through'
            )}
          >
            <Highlight text={task.title} needle={needle} />
          </p>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-muted">
            <span className="whitespace-nowrap tabular-nums">
              {formatTimeRange(task.startTime, task.endTime)}
            </span>
            <span className="text-line">·</span>
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

        {/* Date chip */}
        <button
          type="button"
          onClick={onGoToDate}
          aria-label={`Go to ${relativeDayLabel(task.dueDate)}`}
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
          className="icon-button h-8 w-8 shrink-0 opacity-0 transition hover:text-danger group-hover:opacity-100"
        >
          <X size={15} />
        </button>
      </div>
    </li>
  );
}

// ── Keyword highlight ────────────────────────────────────────────────────────

function Highlight({ text, needle }: { text: string; needle: string }) {
  const idx = text.toLowerCase().indexOf(needle);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-brand/15 text-brand not-italic">
        {text.slice(idx, idx + needle.length)}
      </mark>
      {text.slice(idx + needle.length)}
    </>
  );
}
