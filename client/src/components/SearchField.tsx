import { Search, X } from 'lucide-react';
import { cn } from '../lib/cn';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search for a task',
  className,
  ariaLabel = 'Search tasks',
}: SearchFieldProps) {
  return (
    <div className={cn('relative', className)}>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-11 w-full rounded-xl border border-line bg-white pl-4 pr-11 text-[14px] text-ink outline-none transition placeholder:text-muted/80 focus:border-brand focus:ring-4 focus:ring-brand/10 [&::-webkit-search-cancel-button]:hidden"
      />

      {value ? (
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
  );
}
