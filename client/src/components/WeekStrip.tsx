import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';
import {
  addDays,
  formatDayAbbrev,
  formatDayNumber,
  formatMonthYear,
  isToday,
  startOfWeek,
  weekDays,
} from '../lib/date';
import type { Task } from '../types';

interface WeekStripProps {
  weekStart: string;
  selectedDay: string;
  tasks: Task[];
  onSelectDay: (day: string) => void;
  onChangeWeek: (weekStart: string) => void;
  onToday: () => void;
}

export function WeekStrip({
  weekStart,
  selectedDay,
  tasks,
  onSelectDay,
  onChangeWeek,
  onToday,
}: WeekStripProps) {
  const days = weekDays(weekStart);
  const taskDays = new Set(tasks.map((task) => task.dueDate));

  return (
    <section aria-label="Choose a day">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {formatMonthYear(selectedDay)}
        </p>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onChangeWeek(startOfWeek(addDays(weekStart, -7)))}
            aria-label="Previous week"
            className="icon-button h-7 w-7"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="rounded-md px-2 py-1 text-[11px] font-semibold text-brand transition hover:bg-brand-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onChangeWeek(startOfWeek(addDays(weekStart, 7)))}
            aria-label="Next week"
            className="icon-button h-7 w-7"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const active = day === selectedDay;
          const hasTasks = taskDays.has(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(day)}
              aria-pressed={active}
              aria-label={`${formatDayAbbrev(day)} ${formatDayNumber(day)}${
                hasTasks ? ', has tasks' : ''
              }`}
              className={cn(
                'group flex flex-col items-center gap-1 rounded-xl py-2.5 transition',
                active ? 'bg-brand text-white shadow-fab' : 'text-muted hover:bg-surface'
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-medium uppercase tracking-wide',
                  active ? 'text-white/80' : 'text-muted'
                )}
              >
                {formatDayAbbrev(day)}
              </span>
              <span
                className={cn(
                  'font-display text-[15px] font-semibold leading-none',
                  active ? 'text-white' : 'text-ink'
                )}
              >
                {formatDayNumber(day)}
              </span>
              <span
                className={cn(
                  'h-1 w-1 rounded-full',
                  active ? 'bg-white' : hasTasks ? 'bg-brand/60' : 'bg-transparent'
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Keyboard users can jump back to today with a shortcut hint on desktop. */}
      <p className="sr-only">Week starts Monday and ends Sunday. Today is {isToday(selectedDay) ? 'selected' : 'not selected'}.</p>
    </section>
  );
}
