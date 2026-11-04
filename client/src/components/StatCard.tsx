import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  tone: 'blue' | 'red';
}

const tones = {
  blue: {
    card: 'bg-[#E9ECFC]',
    icon: 'text-brand',
    value: 'text-ink',
  },
  red: {
    card: 'bg-[#FDEAEA]',
    icon: 'text-[#EF5B4C]',
    value: 'text-ink',
  },
} as const;

export function StatCard({ label, value, icon, tone }: StatCardProps) {
  const palette = tones[tone];
  const display = value < 10 ? `0${value}` : String(value);

  return (
    <div className={cn('rounded-2xl px-3.5 py-3.5', palette.card)}>
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white shadow-[0_2px_6px_rgba(19,26,46,0.06)]',
            palette.icon
          )}
        >
          {icon}
        </span>
        <p className="text-[11px] font-semibold leading-tight text-ink/70">{label}</p>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <p className={cn('font-display text-[26px] font-semibold leading-none', palette.value)}>
          {display}
        </p>
        <p className="text-[10px] font-medium text-ink/45">This Week</p>
      </div>
    </div>
  );
}
