import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, CalendarDays, Clock, Loader2, Trash2, X } from 'lucide-react';
import { ApiError, errorMessage } from '../lib/api';
import { cn } from '../lib/cn';
import { dateKey } from '../lib/date';
import type { Priority, Task, TaskInput } from '../types';
import { useTasks } from '../context/TasksContext';
import { useToast } from '../context/ToastContext';

interface TaskModalProps {
  mode: 'create' | 'edit';
  task?: Task;
  initialDate?: string;
  onClose: () => void;
}

const priorityOptions: Array<{ value: Priority; label: string; activeClass: string }> = [
  { value: 'low', label: 'Low', activeClass: 'border-emerald-500 bg-emerald-500 text-white' },
  { value: 'medium', label: 'Medium', activeClass: 'border-amber-500 bg-amber-500 text-white' },
  { value: 'high', label: 'High', activeClass: 'border-rose-500 bg-rose-500 text-white' },
];

function emptyForm(date: string): TaskInput {
  return {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: date,
    startTime: '',
    endTime: '',
  };
}

/** Mirrors the server rules so obvious mistakes never hit the network. */
function validate(form: TaskInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.title.trim()) errors.title = 'Give your task a title.';
  if (!form.dueDate) errors.dueDate = 'Pick a date for this task.';
  if (!form.startTime) errors.startTime = 'Set a start time.';
  if (form.startTime && form.endTime && form.endTime <= form.startTime) {
    errors.endTime = 'End time must be later than start time.';
  }
  return errors;
}

export function TaskModal({ mode, task, initialDate, onClose }: TaskModalProps) {
  const { createTask, updateTask, deleteTask } = useTasks();
  const { showToast } = useToast();

  const [form, setForm] = useState<TaskInput>(() =>
    task
      ? {
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate,
          startTime: task.startTime,
          endTime: task.endTime,
        }
      : emptyForm(initialDate ?? dateKey())
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Lock the page behind the sheet and close on Escape.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const timer = window.setTimeout(() => titleRef.current?.focus(), 240);
    return () => window.clearTimeout(timer);
  }, []);

  const update = <Key extends keyof TaskInput>(key: Key, value: TaskInput[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      titleRef.current?.focus();
      return;
    }

    setSaving(true);
    try {
      if (mode === 'edit' && task) {
        await updateTask(task.id, form);
        showToast('Task updated');
      } else {
        await createTask(form);
        showToast('Task created');
      }
      onClose();
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors);
      showToast(errorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    setSaving(true);
    await deleteTask(task);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="relative z-10 max-h-[92dvh] w-full animate-sheet-up overflow-y-auto rounded-t-[26px] bg-white shadow-sheet sm:max-w-[520px] sm:animate-pop-in sm:rounded-[26px]"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line sm:hidden" />

        <div className="flex items-center justify-between px-5 pb-4 pt-4 sm:px-7 sm:pt-6">
          <h2 id="task-modal-title" className="font-display text-[17px] font-semibold text-ink">
            {mode === 'create' ? 'Add New Task' : 'Edit Task'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="icon-button -mr-1.5">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-line px-5 pb-6 pt-5 sm:px-7">
          <div>
            <label htmlFor="task-title" className="label">
              Task title <span className="text-danger">*</span>
            </label>
            <input
              id="task-title"
              ref={titleRef}
              value={form.title}
              onChange={(event) => update('title', event.target.value)}
              placeholder="Doing Homework"
              maxLength={120}
              aria-invalid={Boolean(errors.title)}
              className={cn('field', errors.title && 'field-error')}
            />
            {errors.title && <FieldError message={errors.title} />}
          </div>

          <div className="mt-4">
            <span className="label">Set Time</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <Clock
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(event) => update('startTime', event.target.value)}
                    aria-label="Start time"
                    aria-invalid={Boolean(errors.startTime)}
                    className={cn('field pl-9', errors.startTime && 'field-error')}
                  />
                </div>
                <p className="mt-1.5 text-[10.5px] font-medium text-muted">Start · required</p>
                {errors.startTime && <FieldError message={errors.startTime} />}
              </div>

              <div>
                <div className="relative">
                  <Clock
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(event) => update('endTime', event.target.value)}
                    aria-label="End time"
                    aria-invalid={Boolean(errors.endTime)}
                    className={cn('field pl-9', errors.endTime && 'field-error')}
                  />
                </div>
                <p className="mt-1.5 text-[10.5px] font-medium text-muted">Ends · optional</p>
                {errors.endTime && <FieldError message={errors.endTime} />}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="task-date" className="label">
              Set Date <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                id="task-date"
                type="date"
                value={form.dueDate}
                onChange={(event) => update('dueDate', event.target.value)}
                aria-invalid={Boolean(errors.dueDate)}
                className={cn('field pr-10', errors.dueDate && 'field-error')}
              />
              <CalendarDays
                size={17}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
            {errors.dueDate && <FieldError message={errors.dueDate} />}
          </div>

          <div className="mt-4">
            <span className="label">Priority</span>
            <div className="grid grid-cols-3 gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update('priority', option.value)}
                  aria-pressed={form.priority === option.value}
                  className={cn(
                    'h-10 rounded-xl border text-[12.5px] font-semibold transition',
                    form.priority === option.value
                      ? option.activeClass
                      : 'border-line bg-white text-ink/60 hover:bg-surface'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="task-description" className="label">
              Description <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="task-description"
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Add Description"
              rows={3}
              maxLength={1000}
              className="w-full resize-none rounded-xl border border-line bg-white px-3.5 py-3 text-[15px] leading-relaxed text-ink outline-none transition placeholder:text-muted/80 focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-[15px] font-semibold text-white shadow-fab transition hover:bg-brand-600 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 size={17} className="animate-spin" />}
            {mode === 'create' ? 'Create task' : 'Save changes'}
          </button>

          {mode === 'edit' && task && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-semibold text-danger transition hover:bg-danger/5 disabled:opacity-60"
            >
              <Trash2 size={15} />
              Delete task
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-[11.5px] font-medium text-danger">
      <AlertCircle size={12} />
      {message}
    </p>
  );
}
