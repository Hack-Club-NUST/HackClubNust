import type { ReactNode } from 'react';
import { PHOSPHOR } from './data';
import { HUD_TEXT } from './scene';

/** The shared skeleton inside a tube: HUD row, flexible stage, footer row. */
export function Screen({ hud, stage, footer }: { hud: ReactNode; stage: ReactNode; footer: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col p-4 font-mono sm:p-6">
      <div className={`flex h-5 shrink-0 items-center justify-between gap-3 ${HUD_TEXT} ${PHOSPHOR.secondary}`}>
        {hud}
      </div>
      <div className="relative mt-3 min-h-0 flex-1">{stage}</div>
      <div className="mt-3 shrink-0">{footer}</div>
    </div>
  );
}

/** Attract title card: the game's name in Anton with tube "ghosting", and its tag. */
export function TitleStage({ title, tag, hidden }: { title: string; tag: string; hidden: boolean }) {
  return (
    <div className={`flex h-full flex-col items-center justify-center gap-3 ${hidden ? 'opacity-0' : ''}`}>
      <p className="whitespace-pre-line text-center font-display text-[clamp(38px,4.6vw,68px)] uppercase leading-[0.9] text-fg [text-shadow:0_0_28px_rgba(237,74,82,0.6),0_0_2px_rgba(244,241,236,0.5)]">
        {title}
      </p>
      <span className="tag border-brand/40 text-brand">{tag}</span>
    </div>
  );
}

/** Title-card footer: PRESS START_ on the left, the run length on the right. */
export function TitleFooter({ right, frozen }: { right: string; frozen: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${HUD_TEXT}`}>
      <span className={`${PHOSPHOR.accent} ${PHOSPHOR.glow}`}>
        PRESS START
        <span className={frozen ? '' : 'animate-blink'}>_</span>
      </span>
      <span className={PHOSPHOR.secondary}>{right}</span>
    </div>
  );
}
