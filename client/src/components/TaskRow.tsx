import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../lib/cn';
import { formatShortDate, formatTimeRange } from '../lib/date';
import type { Task } from '../types';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

const ACTION_WIDTH = 88; // width of the revealed "Delete" action, in px
const SWIPE_THRESHOLD = ACTION_WIDTH / 2;

const priorityStyles: Record<Task['priority'], string> = {
  low: 'bg-emerald-50 text-emerald-600',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-rose-50 text-rose-600',
};

interface TaskRowProps {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  /** Shows time + priority under the title (used outside the home list). */
  showMeta?: boolean;
  /** Adds the due date to the meta line (used in search results). */
  showDate?: boolean;
}

export function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
  showMeta = false,
  showDate = false,
}: TaskRowProps) {
  const [offset, setOffset] = useState(0);
  const [pendingDelete, setPendingDelete] = useState(false);
  const drag = useRef<{
    startX: number;
    startY: number;
    baseOffset: number;
    horizontal: boolean | null;
  } | null>(null);
  const dragged = useRef(false);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if ((event.target as HTMLElement).closest('button[data-no-swipe]')) return;

    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseOffset: offset,
      horizontal: null,
    };
    dragged.current = false;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state) return;

    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;

    // Wait until the gesture's direction is clear so vertical scrolling wins.
    if (state.horizontal === null) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
      state.horizontal = Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
      if (state.horizontal) event.currentTarget.setPointerCapture(event.pointerId);
    }

    if (!state.horizontal) return;

    if (Math.abs(deltaX) > 8) dragged.current = true;
    setOffset(Math.max(-ACTION_WIDTH, Math.min(0, state.baseOffset + deltaX)));
  };

  const handlePointerEnd = () => {
    const state = drag.current;
    drag.current = null;
    if (!state?.horizontal) return;
    setOffset(offset < -SWIPE_THRESHOLD ? -ACTION_WIDTH : 0);
  };

  const guardClick = (action: () => void) => () => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    if (offset !== 0) {
      setOffset(0);
      return;
    }
    action();
  };

  return (
    <li className="relative overflow-hidden border-b border-line last:border-0">
      {/* Action revealed by swiping left */}
      <div className="absolute inset-y-0 right-0 flex w-[88px] items-stretch">
        <button
          type="button"
          data-no-swipe
          onClick={() => setPendingDelete(true)}
          aria-label={`Delete ${task.title}`}
          className="flex w-full flex-col items-center justify-center gap-1 bg-danger text-[10px] font-semibold text-white transition hover:bg-[#DB4A3C]"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        style={{ transform: `translateX(${offset}px)` }}
        className={cn(
          'relative flex touch-pan-y select-none items-center gap-3 bg-white py-3.5',
          offset === 0 && 'transition-transform duration-200 ease-out'
        )}
      >
        <button
          type="button"
          data-no-swipe
          onClick={guardClick(() => onToggle(task))}
          aria-pressed={task.completed}
          aria-label={task.completed ? `Mark ${task.title} as open` : `Mark ${task.title} as complete`}
          className={cn(
            'grid h-[21px] w-[21px] shrink-0 place-items-center rounded-[6px] border-[1.5px] transition',
            task.completed
              ? 'border-brand bg-brand text-white'
              : 'border-ink/20 bg-white text-transparent hover:border-brand/60'
          )}
        >
          <Check size={13} strokeWidth={3.5} />
        </button>

        <button
          type="button"
          data-no-swipe
          onClick={guardClick(() => onEdit(task))}
          className="min-w-0 flex-1 text-left"
        >
          <p
            className={cn(
              'truncate text-[13.5px] font-medium leading-snug text-ink',
              task.completed && 'text-muted line-through'
            )}
          >
            {task.title}
          </p>

          {showMeta && (
            <span className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-1 text-[11px] text-muted">
              <span className="whitespace-nowrap tabular-nums">
                {formatTimeRange(task.startTime, task.endTime)}
              </span>
              {showDate && <span className="text-line">•</span>}
              {showDate && <span className="whitespace-nowrap">{formatShortDate(task.dueDate)}</span>}
              <span
                className={cn(
                  'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize',
                  priorityStyles[task.priority]
                )}
              >
                {task.priority}
              </span>
            </span>
          )}
        </button>

        <button
          type="button"
          data-no-swipe
          onClick={() => setPendingDelete(true)}
          aria-label={`Delete ${task.title}`}
          className="icon-button h-8 w-8 shrink-0 hover:text-danger"
        >
          <Trash2 size={15} />
        </button>
        <button
          type="button"
          data-no-swipe
          onClick={() => onEdit(task)}
          aria-label={`Edit ${task.title}`}
          className="icon-button h-8 w-8 shrink-0 hover:text-brand"
        >
          <Pencil size={15} />
        </button>
      </div>

      {pendingDelete && (
        <ConfirmDeleteDialog
          taskTitle={task.title}
          onConfirm={() => { setPendingDelete(false); setOffset(0); onDelete(task); }}
          onCancel={() => { setPendingDelete(false); setOffset(0); }}
        />
      )}
    </li>
  );
}
