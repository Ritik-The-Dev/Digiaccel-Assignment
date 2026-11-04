export function TaskListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul aria-hidden className="animate-pulse">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="flex items-center gap-3 border-b border-line py-4 last:border-0">
          <span className="h-[21px] w-[21px] rounded-[6px] bg-line" />
          <span className="h-3 flex-1 rounded-full bg-line" style={{ maxWidth: `${70 - index * 8}%` }} />
          <span className="h-4 w-4 rounded bg-line" />
        </li>
      ))}
    </ul>
  );
}
