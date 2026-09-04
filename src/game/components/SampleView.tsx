import type { Sample } from '../types';

interface SampleViewProps {
  sample: Sample;
  compact?: boolean;
  /** Credits identify the source, so they only appear once the answer is out. */
  showCredit?: boolean;
}

export default function SampleView({ sample, compact = false, showCredit = false }: SampleViewProps) {
  const maxH = compact ? 'max-h-[26vh]' : 'max-h-[38vh]';

  const body =
    sample.kind === 'image' ? (
      <img
        src={sample.content}
        alt="Sample to judge"
        className={`w-full ${compact ? 'h-[26vh]' : 'h-[38vh]'} bg-black/40 object-contain`}
        draggable={false}
      />
    ) : sample.kind === 'code' ? (
      <pre
        className={`${maxH} overflow-auto px-4 py-4 text-[11px] leading-relaxed text-white/85 sm:text-[13px]`}
      >
        <code>{sample.content}</code>
      </pre>
    ) : (
      <p
        className={`${maxH} overflow-auto whitespace-pre-line px-5 py-5 text-[13px] leading-relaxed text-white/85 sm:text-[15px]`}
      >
        {sample.content}
      </p>
    );

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
      {sample.kind === 'code' && (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="text-[11px] uppercase tracking-[0.15em] text-white/35">{sample.lang}</span>
          <span className="text-[11px] uppercase tracking-[0.15em] text-white/25">snippet</span>
        </div>
      )}
      {body}
      {showCredit && sample.credit && (
        <div className="border-t border-white/10 px-4 py-2 text-[10px] leading-relaxed text-white/30">
          {sample.credit.author} · {sample.credit.license} ·{' '}
          <a href={sample.credit.source} target="_blank" rel="noreferrer" className="underline">
            source
          </a>
        </div>
      )}
    </div>
  );
}
