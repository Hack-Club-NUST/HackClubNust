import type { LeaderboardEntry, Player } from '../types';

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
  player: Player | null;
  limit?: number;
  title?: string;
}

export default function LeaderboardPanel({
  entries,
  player,
  limit = 10,
  title = 'Club leaderboard',
}: LeaderboardPanelProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 px-5 py-6 text-center text-[13px] text-white/35">
        No runs yet. Be the first name on the board.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.15em] text-white/35">{title}</span>
        <span className="text-[11px] text-white/25">best run per player</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {entries.slice(0, limit).map((entry) => {
          const isYou = player?.id === entry.player_id;
          const isLeader = entry.position === 1;
          return (
            <div
              key={entry.player_id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-[12px] sm:text-[13px] ${
                isYou
                  ? 'border-brand/50 bg-brand/[0.08]'
                  : isLeader
                    ? 'border-white/20 bg-white/[0.03]'
                    : 'border-white/[0.07]'
              }`}
            >
              <span
                className={`w-5 shrink-0 tabular-nums ${isLeader ? 'text-brand' : 'text-white/30'}`}
              >
                {entry.position}
              </span>
              {isLeader && <i className="bi bi-trophy-fill text-[12px] text-brand" aria-hidden="true" />}
              <span className={`truncate ${isYou ? 'text-white' : 'text-white/70'}`}>
                {entry.name}
                {isYou && <span className="ml-2 text-[11px] text-brand">you</span>}
              </span>
              <span className="ml-auto shrink-0 text-white/30">
                {entry.correct}/{entry.total}
              </span>
              <span className="w-14 shrink-0 text-right tabular-nums text-white/80">
                {entry.score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
