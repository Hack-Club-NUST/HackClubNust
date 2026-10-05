import { INSTAGRAM, RECORD } from '../../events';

/** The rest of the record, as a mono ledger. Detail only where events.ts has a source for it. */
export default function Ledger() {
  return (
    <div className="mt-20 lg:mt-24">
      <p className="rule-label">The record · since 2021</p>
      <ol className="mt-8 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {RECORD.map((item, i) => (
          <li key={item.name} className="border-t border-line py-5">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-[12px] tabular-nums text-fg-3">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h4 className="font-mono text-[16px] leading-snug text-fg">{item.name}</h4>
            </div>
            {item.detail && (
              <p className="mt-2 pl-[calc(2ch+1rem)] font-sans text-[14px] leading-[1.55] text-fg-2">
                {item.detail}
              </p>
            )}
          </li>
        ))}
      </ol>
      <a
        href={INSTAGRAM}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex items-center gap-2 font-mono text-[13px] text-fg-3 transition-colors duration-[180ms] hover:text-signal"
      >
        <i className="bi bi-instagram text-[14px]" aria-hidden="true" />
        Every event, on @hackclub.nust
        <i className="bi bi-arrow-up-right text-[11px]" aria-hidden="true" />
      </a>
    </div>
  );
}
