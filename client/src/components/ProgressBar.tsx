import { cn } from '../lib/cn';

interface ProgressBarProps {
  /** 0 → 1 */
  value: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
  label?: string;
}

export function ProgressBar({
  value,
  className,
  trackClassName,
  barClassName,
  label = 'Weekly progress',
}: ProgressBarProps) {
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${percent}% complete`}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-brand-100', trackClassName, className)}
    >
      <div
        className={cn('h-full rounded-full bg-brand transition-[width] duration-500 ease-out', barClassName)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
