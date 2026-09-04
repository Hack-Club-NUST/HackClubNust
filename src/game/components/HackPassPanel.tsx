import { motion } from 'framer-motion';
import type { HackPassProgress, HackPassStatus } from '../hackpass';

const GAME_LABEL: Record<keyof HackPassProgress, string> = {
  'ai-human': 'AI vs Human',
  'cipher-tunes': 'Cipher Tunes',
};

interface HackPassPanelProps {
  progress: HackPassProgress | null;
  hackpass: HackPassStatus | null;
  justIssued?: boolean;
  /** Compact form for intro/practice screens — no progress bars, just the code if held. */
  compact?: boolean;
}

function ProgressBar({ label, best, threshold }: { label: string; best: number; threshold: number }) {
  const pct = Math.min(100, Math.round((best / threshold) * 100));
  const met = best >= threshold;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-[12px]">
        <span className="text-white/50">{label}</span>
        <span className={met ? 'text-emerald-400' : 'text-white/40'}>
          <span className="tabular-nums">{best}</span>
          <span className="text-white/25"> / {threshold}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${met ? 'bg-emerald-400' : 'bg-brand-grad'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function HackPassPanel({
  progress,
  hackpass,
  justIssued = false,
  compact = false,
}: HackPassPanelProps) {
  if (hackpass) {
    return (
      <motion.div
        initial={justIssued ? { opacity: 0, scale: 0.96 } : false}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-brand/50 bg-brand/[0.08] p-5"
      >
        <div className="flex items-center gap-3">
          <i className="bi bi-ticket-perforated-fill text-[20px] text-brand" aria-hidden="true" />
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-white">
              {justIssued ? 'You just earned a HackPass' : 'You hold a HackPass'}
            </div>
            {!compact && (
              <div className="mt-0.5 text-[12px] text-white/50">
                {hackpass.redeemed ? 'Already redeemed.' : 'Show this code at a participating cafe.'}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/15 bg-black/30 px-4 py-3">
          <span className="text-[20px] font-bold tracking-[0.15em] text-white">{hackpass.code}</span>
          {hackpass.redeemed && (
            <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/40">
              redeemed
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  if (compact || !progress) return null;

  const games = Object.keys(progress) as Array<keyof HackPassProgress>;

  return (
    <div className="rounded-2xl border border-white/10 p-5">
      <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-white/35">
        <i className="bi bi-ticket-perforated" aria-hidden="true" />
        HackPass — clear both bars to earn one
      </div>
      <div className="flex flex-col gap-3">
        {games.map((game) => (
          <ProgressBar
            key={game}
            label={GAME_LABEL[game]}
            best={progress[game].best}
            threshold={progress[game].threshold}
          />
        ))}
      </div>
    </div>
  );
}
