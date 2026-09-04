export default function TimerBar({ msLeft, limitMs }: { msLeft: number; limitMs: number }) {
  const ratio = limitMs > 0 ? Math.max(0, Math.min(1, msLeft / limitMs)) : 0;
  const urgent = msLeft <= 4000;
  const seconds = Math.ceil(msLeft / 1000);

  return (
    <div className="flex items-center gap-3">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-[width] duration-100 ease-linear ${
            urgent ? 'bg-amber-400' : 'bg-brand-grad'
          }`}
          style={{ width: `${ratio * 100}%` }}
          role="progressbar"
          aria-label="Time remaining"
          aria-valuemin={0}
          aria-valuemax={Math.ceil(limitMs / 1000)}
          aria-valuenow={seconds}
        />
      </div>
      <span
        className={`w-8 shrink-0 text-right text-[13px] tabular-nums ${
          urgent ? 'text-amber-400' : 'text-white/50'
        }`}
      >
        {seconds}s
      </span>
    </div>
  );
}
