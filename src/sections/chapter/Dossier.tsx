import { useRef, type RefObject } from 'react';
import { useInView } from 'framer-motion';
import ScrambleIn from '../../components/ScrambleIn';
import { CYBER_HACKATHON } from '../../events';
import { FRAME_SCRIM } from './art';
import TorchArt from './TorchArt';

const LABEL = 'font-mono text-[12px] uppercase tracking-[0.08em]';
const H3 = 'text-balance font-mono text-[clamp(20px,2.4vw,28px)] leading-tight tracking-[-0.02em] text-fg';

/** "PKR 275,000" → ["PKR", "275,000"]; no space → no prefix. */
function splitValue(value: string): [string, string] {
  const at = value.indexOf(' ');
  return at === -1 ? ['', value] : [value.slice(0, at), value.slice(at + 1)];
}

interface DossierProps {
  /** bleed: art lives behind the section, text sits in the left 5/12. frame: art in a 3:4 frame. */
  bleed: boolean;
  reduce: boolean;
  frameRef: RefObject<HTMLDivElement>;
  litRef: RefObject<HTMLDivElement>;
}

/** The flagship, The Cyber Hackathon ’26, as a dossier locked in viewfinder brackets. */
export default function Dossier({ bleed, reduce, frameRef, litRef }: DossierProps) {
  const ch = CYBER_HACKATHON;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <article
      ref={ref}
      className={`relative mt-16 lg:mt-20 ${
        bleed ? 'grid grid-cols-12' : 'md:grid md:grid-cols-12 md:items-start md:gap-10'
      }`}
    >
      {!bleed && (
        // ticks live on an outer wrapper: the frame itself clips (overflow-hidden) and would cut them
        <div className="card-ticks relative md:col-span-5">
          <span className="card-ticks-alt" aria-hidden="true" />
          <div
            ref={frameRef}
            className="relative aspect-[3/4] w-full overflow-hidden rounded-[4px] [touch-action:pan-y]"
          >
            <TorchArt variant="frame" reduce={reduce} litRef={litRef} />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: FRAME_SCRIM }}
            />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className={`${LABEL} text-fg-2`}>{ch.kicker}</p>
              <h3 className={`mt-2 ${H3}`}>{ch.name}</h3>
            </div>
          </div>
        </div>
      )}

      <div
        className={
          bleed
            ? 'card-ticks relative col-span-5 p-10 text-fg'
            : 'relative mt-8 text-fg md:col-span-7 md:mt-0'
        }
      >
        {bleed && (
          <>
            <span className="card-ticks-alt" aria-hidden="true" />
            <p className={`${LABEL} text-fg-3`}>{ch.kicker}</p>
            <h3 className={`mt-3 ${H3}`}>{ch.name}</h3>
          </>
        )}

        <p className={`${bleed ? 'mt-5' : ''} font-sans text-[16px] leading-[1.6] text-fg-2`}>
          {ch.summary}
        </p>

        {/* numerals span both columns; the two label facts sit side by side */}
        <dl className="mt-8 grid grid-cols-2">
          {ch.facts.map((fact, i) => {
            if (i < 2) {
              const [prefix, amount] = splitValue(fact.value);
              return (
                <div key={fact.label} className="col-span-2 border-t border-line py-5">
                  <dt className={`${LABEL} text-fg-3`}>{fact.label}</dt>
                  <dd className="mt-2 whitespace-nowrap font-mono text-[clamp(40px,6vw,72px)] leading-none tracking-[-0.04em] text-fg tabular-nums">
                    {prefix && (
                      <span className="mr-[0.18em] align-top text-[0.36em] tracking-normal text-fg-3">
                        {prefix}
                      </span>
                    )}
                    {reduce ? amount : <ScrambleIn text={amount} delay={i * 250} triggered={inView} />}
                  </dd>
                </div>
              );
            }
            return (
              <div key={fact.label} className={`border-t border-line py-5 ${i % 2 ? 'pl-3' : 'pr-3'}`}>
                <dt className={`${LABEL} text-fg-3`}>{fact.label}</dt>
                <dd className={`mt-2 ${H3}`}>{fact.value}</dd>
              </div>
            );
          })}
        </dl>

        <p className="mt-8 border-t border-line pt-6 font-sans text-[14px] leading-[1.55] text-fg-2">
          {ch.closing}
        </p>

        <div className="mt-6">
          <p className={`${LABEL} text-fg-3`}>Partners</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {ch.partners.map((p) => (
              <li key={p} className="tag">
                {p}
              </li>
            ))}
          </ul>
        </div>

        <a
          href={ch.post}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex w-fit items-center gap-2 font-mono text-[13px] text-fg-3 transition-colors duration-[180ms] hover:text-signal"
        >
          <i className="bi bi-instagram text-[14px]" aria-hidden="true" />
          The closing ceremony on Instagram
          <i className="bi bi-arrow-up-right text-[11px]" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
