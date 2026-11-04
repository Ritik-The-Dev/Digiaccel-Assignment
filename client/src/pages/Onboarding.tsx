import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarCheck2, CheckCircle2, Clock3, Plus } from 'lucide-react';
import { Brand } from '../components/Brand';
import { markOnboarded } from '../components/AppShell';

/** A little preview of the product, shown floating in the blue hero. */
function PreviewCard() {
  return (
    <div className="relative w-full max-w-[300px] rounded-2xl bg-white p-4 shadow-[0_30px_60px_-30px_rgba(8,15,45,0.55)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-ink">Today&apos;s tasks</p>
        <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand">
          3 left
        </span>
      </div>

      <ul className="mt-3 space-y-2.5">
        {[
          { title: 'Team standup', time: '09:30', done: true },
          { title: 'Design review', time: '11:00', done: false },
          { title: 'Ship the release', time: '16:30', done: false },
        ].map((item) => (
          <li key={item.title} className="flex items-center gap-2.5">
            <span
              className={
                item.done
                  ? 'grid h-4 w-4 shrink-0 place-items-center rounded-[5px] bg-brand text-white'
                  : 'h-4 w-4 shrink-0 rounded-[5px] border-[1.5px] border-ink/20'
              }
            >
              {item.done && <CheckCircle2 size={11} strokeWidth={3} />}
            </span>
            <span
              className={
                item.done
                  ? 'flex-1 truncate text-[11.5px] text-muted line-through'
                  : 'flex-1 truncate text-[11.5px] font-medium text-ink'
              }
            >
              {item.title}
            </span>
            <span className="text-[10px] tabular-nums text-muted">{item.time}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-brand-100">
        <div className="h-full w-1/3 rounded-full bg-brand" />
      </div>
    </div>
  );
}

export function Onboarding() {
  const navigate = useNavigate();

  const start = () => {
    markOnboarded();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-hidden bg-brand lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Blue hero */}
      <div className="relative flex flex-1 flex-col overflow-hidden px-6 pb-8 pt-8 lg:justify-between lg:p-12">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <pattern
              id="chevrons"
              width="76"
              height="76"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(10)"
            >
              <path
                d="M0 34 L38 10 L76 34"
                fill="none"
                stroke="rgba(255,255,255,0.30)"
                strokeWidth="2"
              />
              <path
                d="M0 60 L38 36 L76 60"
                fill="none"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="2"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#chevrons)" />
        </svg>

        <div
          className="pointer-events-none absolute -right-24 -top-24 h-[280px] w-[280px] rounded-full bg-white/10 lg:h-[420px] lg:w-[420px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-20 h-52 w-52 rounded-full bg-white/[0.07]"
          aria-hidden
        />

        <div className="relative">
          <Brand light />
        </div>

        <div className="relative mt-6 hidden lg:mt-0 lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
            Weekly planning
          </p>
          <h2 className="mt-3 max-w-[420px] font-display text-[38px] font-semibold leading-[1.1] text-white">
            Plan your week, finish your day.
          </h2>
          <p className="mt-3 max-w-[360px] text-[13.5px] leading-relaxed text-white/70">
            Group tasks Monday to Sunday, track what is open and completed, and keep every deadline
            in sight.
          </p>
        </div>

        <div className="relative mt-auto flex justify-center pt-8 lg:justify-start lg:pt-0">
          <PreviewCard />
        </div>
      </div>

      {/* White panel */}
      <div className="relative rounded-t-[30px] bg-white px-6 pb-8 pt-7 lg:flex lg:items-center lg:rounded-none lg:px-14">
        <div className="w-full lg:mx-auto lg:max-w-[420px]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-brand">
            <CalendarCheck2 size={12} />
            Get organised
          </span>

          <h1 className="mt-4 font-display text-[27px] font-semibold leading-[1.15] text-ink lg:text-[34px]">
            Manage What To Do
          </h1>
          <p className="mt-2.5 max-w-[330px] text-[13.5px] leading-relaxed text-muted">
            The best way to manage what you have to do, don&apos;t forget your plans.
          </p>

          <ul className="mt-5 hidden gap-3 sm:grid sm:grid-cols-2 lg:mt-7">
            {[
              { icon: Clock3, text: 'Schedule with times' },
              { icon: CheckCircle2, text: 'Track weekly progress' },
            ].map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5 text-[11.5px] font-medium text-ink/70"
              >
                <Icon size={14} className="text-brand" />
                {text}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={start}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-[15px] font-semibold text-white shadow-fab transition hover:bg-brand-600 active:scale-[0.995] lg:mt-8"
          >
            Get Started
            <ArrowRight size={17} />
          </button>

          <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-muted">
            <Plus size={12} />
            No account needed — your tasks live in your own API.
          </p>
        </div>
      </div>
    </div>
  );
}
