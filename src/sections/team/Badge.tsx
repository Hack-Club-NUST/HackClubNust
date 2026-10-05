import { motion, useTransform } from 'framer-motion';
import type { OfficeBearer } from '../../team';
import type { MotionValue } from 'framer-motion';
import HackClubLogo from '../../components/HackClubLogo';
import { SWING_LIMIT } from './constants';
import type { HangerBinding } from './useSwing';

/** First letter of the first and last name: "Malik Usman" → "MU". */
const initials = (name: string) => {
  const p = name.trim().split(/\s+/);
  return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
};

const clampSwing = (v: number) => Math.min(SWING_LIMIT, Math.max(-SWING_LIMIT, v));

// a printed barcode: bars of 1–2px in pen, purely decorative
const BARCODE =
  '[background-image:repeating-linear-gradient(90deg,#141114_0_1px,transparent_1px_3px,#141114_3px_5px,transparent_5px_6px,#141114_6px_7px,transparent_7px_10px,#141114_10px_11px,transparent_11px_14px)]';

interface BadgeProps {
  member: OfficeBearer;
  index: number;
  rot: MotionValue<number>;
  enabled: boolean;
  bind: HangerBinding;
}

/**
 * One staff pass on its lanyard. The hanger (strap + clip + ring + card) is a single rigid
 * pendulum pivoting at its top centre, where the strap meets the rail.
 */
export default function Badge({ member, index, rot, enabled, bind }: BadgeProps) {
  const rotate = useTransform(rot, clampSwing);
  const { grabbing, lifted, ...handlers } = bind;

  return (
    <motion.div
      {...(enabled ? handlers : { ref: handlers.ref })}
      role="group"
      aria-labelledby={`team-name-${index} team-role-${index}`}
      tabIndex={enabled ? 0 : -1}
      data-grabbing={grabbing ? 'true' : 'false'}
      style={enabled ? { rotate, originX: 0.5, originY: 0 } : undefined}
      className={`group relative flex select-none flex-col items-center [touch-action:pan-x_pan-y] focus-visible:outline-offset-4 ${
        enabled
          ? 'will-change-transform [@media(hover:hover)]:cursor-grab data-[grabbing=true]:cursor-grabbing'
          : ''
      } ${lifted ? 'z-10' : ''}`}
    >
      {/* strap, woven */}
      <span
        aria-hidden="true"
        className="block h-14 w-3.5 bg-pen [background-image:repeating-linear-gradient(0deg,transparent_0_5px,rgba(242,237,228,0.14)_5px_6px)]"
      />
      {/* clip */}
      <span
        aria-hidden="true"
        className="relative z-[2] -mt-px block h-3 w-6 rounded-[2px] border border-pen/50 bg-paper-3"
      />
      {/* ring through the slot */}
      <span
        aria-hidden="true"
        className="relative z-[1] -mt-1 block h-5 w-2.5 rounded-full border-2 border-pen/60"
      />

      {/* the card */}
      <article className="card-ticks relative -mt-[14px] flex aspect-[3/5] w-full flex-col rounded-[4px] border border-line-paper bg-paper-2 text-pen shadow-[0_1px_0_rgba(20,17,20,0.06),0_16px_28px_-16px_rgba(20,17,20,0.38)]">
        <span className="card-ticks-alt" aria-hidden="true" />

        {/* slot punch */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[10px] h-[7px] w-[22px] -translate-x-1/2 rounded-full bg-paper shadow-[inset_0_1px_2px_rgba(20,17,20,0.45)]"
        />

        {/* top bar */}
        <div
          aria-hidden="true"
          className="mt-[26px] flex h-[22px] items-center justify-between gap-2 whitespace-nowrap bg-pen px-2 font-mono text-[9px] uppercase tracking-[0.12em] text-paper"
        >
          <span className="inline-flex items-center gap-1.5">
            <HackClubLogo size={11} /> Hack Club NUST
          </span>
          <span>Staff</span>
        </div>

        {/* photo well: the portrait where there is one, initials where there isn't */}
        <div
          aria-hidden="true"
          className={`relative mx-3 mt-3 flex flex-1 items-center justify-center overflow-hidden rounded-[2px] ${
            member.photo ? 'bg-ink' : 'bg-paper-3/70'
          }`}
        >
          {member.photo ? (
            <img
              src={member.photo}
              alt=""
              loading="lazy"
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-cover object-[50%_18%]"
            />
          ) : (
            <span className="font-display text-[72px] leading-none tracking-[-0.01em] text-pen">
              {initials(member.name)}
            </span>
          )}
        </div>

        {/* identity */}
        <div className="px-3 pt-3">
          <h3 id={`team-name-${index}`} className="font-mono text-[13px] leading-[1.2] text-pen">
            {member.name}
          </h3>
          <p
            id={`team-role-${index}`}
            className="tag-paper mt-1.5 transition-colors duration-[180ms] group-hover:border-signal-deep/60 group-hover:text-signal-deep group-focus-visible:border-signal-deep/60 group-focus-visible:text-signal-deep"
          >
            {member.role}
          </p>
        </div>

        {/* barcode + meta */}
        <div aria-hidden="true" className="mt-auto px-3 pb-3 pt-3">
          <div className={`h-3 w-full opacity-80 ${BARCODE}`} />
          <div className="mt-1.5 flex justify-between font-mono text-[10px] tracking-[0.12em] text-pen-2">
            <span>NO. {String(index + 1).padStart(2, '0')}</span>
            <span>2026–27</span>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
