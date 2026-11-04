import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-10 text-center',
        className
      )}
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand shadow-card">
        {icon}
      </span>
      <p className="mt-3 text-[13.5px] font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-[260px] text-[12px] leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
