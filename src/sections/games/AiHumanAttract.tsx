import { SAMPLES } from '../../game/data/samples';
import { ROUNDS_PER_RUN } from '../../game/scoring';
import type { Sample } from '../../game/types';
import {
  AI_ATTRACT_IDS,
  CPS_CODE,
  CPS_TEXT,
  PHOSPHOR,
  REVEAL_AT,
  ROUND_CUT_AT,
  ROUND_MS,
  TELL_AT,
  TITLE_CUT_MS,
  TITLE_MS,
  TYPE_CAP,
} from './data';
import { HUD_TEXT, pickScene } from './scene';
import { Screen, TitleFooter, TitleStage } from './Screen';

type Scene =
  | { kind: 'title'; durationMs: number }
  | { kind: 'round'; durationMs: number; sample: Sample; k: number };

const byId = new Map(SAMPLES.map((s) => [s.id, s]));
// Drop any id that has gone missing from the bank: the preview must never crash on a data edit.
const ROUNDS = AI_ATTRACT_IDS.map((id) => byId.get(id)).filter(
  (s): s is Sample => !!s && s.kind !== 'image',
);

// TITLE, R1, R2, TITLE, R3, R4, TITLE, R5, R6 → loop
const SCENES: Scene[] = [];
ROUNDS.forEach((sample, i) => {
  if (i % 2 === 0) SCENES.push({ kind: 'title', durationMs: TITLE_MS });
  SCENES.push({ kind: 'round', durationMs: ROUND_MS, sample, k: i + 1 });
});
if (SCENES.length === 0) SCENES.push({ kind: 'title', durationMs: TITLE_MS });

const FROZEN_LT = 6000;

export default function AiHumanAttract({ t, frozen }: { t: number; frozen: boolean }) {
  const firstRound = SCENES.find((s) => s.kind === 'round');
  const { scene, lt } = frozen && firstRound ? { scene: firstRound, lt: FROZEN_LT } : pickScene(SCENES, t);

  if (scene.kind === 'title') {
    return (
      <Screen
        hud={null}
        stage={<TitleStage title={"MAN OR\nMACHINE?"} tag="AI VS HUMAN" hidden={!frozen && lt < TITLE_CUT_MS} />}
        footer={<TitleFooter right={`${ROUNDS_PER_RUN} ROUNDS`} frozen={frozen} />}
      />
    );
  }

  const { sample: s, k } = scene;
  const isCode = s.kind === 'code';
  const content = s.content.slice(0, TYPE_CAP);
  const shown = frozen ? content.length : Math.min(content.length, Math.floor(lt / (isCode ? CPS_CODE : CPS_TEXT)));
  const typing = shown < content.length;
  const revealed = lt >= REVEAL_AT;
  const tellOn = lt >= TELL_AT;
  const cut = !frozen && lt > ROUND_CUT_AT;
  const answer = s.isAI ? 'AI' : 'HUMAN';

  const chip = (label: 'AI' | 'HUMAN') => {
    const state = !revealed
      ? 'border-white/20 text-fg-2'
      : label === answer
        ? 'border-transparent bg-brand-grad text-white shadow-[0_0_22px_rgba(237,74,82,0.6)]'
        : 'border-white/10 text-fg/25';
    return (
      <span
        className={`flex h-9 flex-1 items-center justify-center rounded-full border text-[12px] tracking-[0.16em] transition-all duration-300 sm:h-10 sm:text-[13px] ${state}`}
      >
        {label === 'AI' ? 'MACHINE' : 'HUMAN'}
      </span>
    );
  };

  return (
    <Screen
      hud={
        <>
          <span className="min-w-0 truncate">
            ROUND {String(k).padStart(2, '0')}/{ROUNDS_PER_RUN} · {s.kind.toUpperCase()} · {s.difficulty.toUpperCase()}
          </span>
          <span className={`shrink-0 ${revealed ? PHOSPHOR.accent : ''}`}>{revealed ? 'CALLED' : 'WHO MADE IT?'}</span>
        </>
      }
      stage={
        <div
          className={`h-full overflow-hidden [mask-image:linear-gradient(to_bottom,#000_72%,transparent)] ${cut ? 'opacity-0' : ''}`}
        >
          {isCode && s.lang && <p className={`mb-1.5 ${HUD_TEXT} text-fg-3`}>{s.lang}</p>}
          <p
            className={`${
              isCode
                ? 'whitespace-pre text-[12px] leading-[1.5] sm:text-[13px]'
                : 'whitespace-pre-wrap font-sans text-[15px] leading-[1.5] sm:text-[17px]'
            } ${PHOSPHOR.primary} ${PHOSPHOR.glow}`}
          >
            {content.slice(0, shown)}
            {!frozen && <span className={typing ? '' : 'animate-blink'}>_</span>}
          </p>
        </div>
      }
      footer={
        <div className={cut ? 'opacity-0' : ''}>
          <p
            className={`mb-3 max-h-[2.9em] overflow-hidden font-sans text-[12px] leading-[1.45] text-fg-2 transition-opacity duration-300 [mask-image:linear-gradient(to_bottom,#000_72%,transparent)] sm:text-[13px] ${
              tellOn ? '' : 'opacity-0'
            }`}
          >
            <span className={`font-mono text-[11px] tracking-[0.14em] ${PHOSPHOR.accent}`}>TELL · </span>
            {s.tell}
          </p>
          <div className="flex gap-2.5">
            {chip('AI')}
            {chip('HUMAN')}
          </div>
        </div>
      }
    />
  );
}
