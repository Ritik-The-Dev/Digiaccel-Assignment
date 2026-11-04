import { Check } from 'lucide-react';
import { cn } from '../lib/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid place-items-center rounded-[11px] bg-brand text-white shadow-fab',
        className
      )}
    >
      <Check size={18} strokeWidth={3.2} />
    </span>
  );
}

interface BrandProps {
  /** Renders the wordmark in white for use on the blue hero. */
  light?: boolean;
  className?: string;
  markClassName?: string;
}

export function Brand({ light = false, className, markClassName }: BrandProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark
        className={cn(
          'h-9 w-9',
          light && 'border border-white/25 bg-white/15 shadow-none backdrop-blur',
          markClassName
        )}
      />
      <span
        className={cn(
          'font-display text-[17px] font-semibold leading-none tracking-tight',
          light ? 'text-white' : 'text-ink'
        )}
      >
        Taskly
      </span>
    </div>
  );
}
