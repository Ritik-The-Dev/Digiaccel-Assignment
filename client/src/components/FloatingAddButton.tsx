import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
  onClick: () => void;
  label?: string;
}

export function FloatingAddButton({ onClick, label = 'Add new task' }: FloatingAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-6 left-1/2 z-40 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-brand text-white shadow-fab transition hover:bg-brand-600 active:scale-95 lg:hidden"
    >
      <Plus size={26} strokeWidth={2.2} />
    </button>
  );
}
