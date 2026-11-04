import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Brand } from '../components/Brand';

export function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-surface px-6 text-center">
      <Brand className="mb-8" />

      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand shadow-card">
        <Compass size={24} />
      </span>

      <h1 className="mt-4 font-display text-[22px] font-semibold text-ink">Page not found</h1>
      <p className="mt-1.5 max-w-[280px] text-[12.5px] leading-relaxed text-muted">
        The page you were looking for does not exist. Your tasks are safe on the home screen.
      </p>

      <Link
        to="/"
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-[13px] font-semibold text-white shadow-fab transition hover:bg-brand-600"
      >
        Back to home
      </Link>
    </div>
  );
}
