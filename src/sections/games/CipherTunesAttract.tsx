import { LETTERS } from '../../game/tunes/alphabet';
import { ROUNDS_PER_RUN as TUNE_ROUNDS, basePointsFor } from '../../game/tunes/scoring';
import {
  ALPHABET_MS,
  CORRECT_AT_PAD,
  CORRECT_POP_MS,
  CUT_MS,
  GAP_MS,
  HOLD_MS,
  LETTER_MS,
  LETTER_ON_MS,
  PHOSPHOR,
  SPELL_FLASH_MS,
  SPELL_MS,
  SWEEP_ON_MS,
  SWEEP_STEP_MS,
  TITLE_CUT_MS,
  TITLE_MS,
  TUNE_ATTRACT_WORDS,
} from './data';
import { pickScene } from './scene';
import { Screen, TitleFooter, TitleStage } from './Screen';

// Silent by design: nothing in this file creates audio. The first sound in the
// section is inside CipherTunesGame, after the visitor's own Play click.

interface WordTiming {
  listenEnd: number;
  spellStart: number;
  correctAt: number;
}

type Scene =
  | { kind: 'title'; durationMs: number }
  | { kind: 'alphabet'; durationMs: number }
  | { kind: 'word'; durationMs: number; word: string; timing: WordTiming };

function wordScene(word: string): Scene {
  const n = word.length;
  const listenEnd = n * LETTER_MS;
  const spellStart = listenEnd + GAP_MS;
  const correctAt = spellStart + n * SPELL_MS + CORRECT_AT_PAD;
  return { kind: 'word', word, timing: { listenEnd, spellStart, correctAt }, durationMs: correctAt + HOLD_MS + CUT_MS };
}

// TITLE, ALPHABET, W1, W2, TITLE, W3, W4, TITLE, ALPHABET, W5, W6 → loop
const SCENES: Scene[] = [];
TUNE_ATTRACT_WORDS.forEach((word, i) => {
  if (i % 2 === 0) {
    SCENES.push({ kind: 'title', durationMs: TITLE_MS });
    if (i % 4 === 0) SCENES.push({ kind: 'alphabet', durationMs: ALPHABET_MS });
  }
  SCENES.push(wordScene(word));
});
if (SCENES.length === 0) SCENES.push({ kind: 'title', durationMs: TITLE_MS });

const muted = <span className="ml-auto shrink-0">MUTED</span>;

function KeyRow({ active }: { active: string | null }) {
  return (
    <div className="flex justify-center gap-1.5 sm:gap-2">
      {LETTERS.map((l) => (
        <span
          key={l}
          className={`flex h-9 w-9 items-center justify-center rounded-[2px] border font-mono text-[13px] sm:h-10 sm:w-10 ${
            l === active
              ? 'border-transparent bg-brand-grad text-white shadow-[0_0_20px_rgba(237,74,82,0.7)]'
              : 'border-white/15 text-fg-3'
          }`}
        >
          {l}
        </span>
      ))}
    </div>
  );
}

/**
 * A silent level meter: bars that swell while a key is lit, as if its tune were
 * playing. Pure function of `lt`, like everything else on the screen.
 */
function Wave({ lt, on }: { lt: number; on: boolean }) {
  return (
    <div className="flex h-8 items-end gap-[3px]">
      {Array.from({ length: 28 }, (_, i) => {
        const v = on ? 0.35 + 0.65 * Math.abs(Math.sin(lt / 90 + i * 0.7) * Math.cos(lt / 210 + i * 0.3)) : 0.12;
        return (
          <span
            key={i}
            className={`w-[3px] rounded-full transition-[height] duration-75 ${on ? 'bg-brand' : 'bg-white/20'}`}
            style={{ height: `${Math.round(v * 100)}%` }}
          />
        );
      })}
    </div>
  );
}

export default function CipherTunesAttract({ t, frozen }: { t: number; frozen: boolean }) {
  const firstWord = SCENES.find((s): s is Extract<Scene, { kind: 'word' }> => s.kind === 'word');
  const { scene, lt } = frozen && firstWord
    ? { scene: firstWord as Scene, lt: firstWord.timing.correctAt + CORRECT_POP_MS }
    : pickScene(SCENES, t);

  if (scene.kind === 'title') {
    return (
      <Screen
        hud={muted}
        stage={<TitleStage title={"HEAR IT.\nSPELL IT."} tag="CIPHER TUNES" hidden={!frozen && lt < TITLE_CUT_MS} />}
        footer={<TitleFooter right={`${TUNE_ROUNDS} WORDS`} frozen={frozen} />}
      />
    );
  }

  if (scene.kind === 'alphabet') {
    const i = Math.floor(lt / SWEEP_STEP_MS);
    const active = i < LETTERS.length && lt - i * SWEEP_STEP_MS < SWEEP_ON_MS ? LETTERS[i] : null;
    return (
      <Screen
        hud={
          <>
            <span className="min-w-0 truncate">LEARN THE BOARD</span>
            {muted}
          </>
        }
        stage={
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <p className="text-center font-display text-[clamp(30px,4.4vw,56px)] uppercase leading-[0.95] text-fg [text-shadow:0_0_24px_rgba(237,74,82,0.45)]">
              Seven letters.
              <br />
              <span className="text-brand">Seven tunes.</span>
            </p>
            <Wave lt={lt} on={active !== null} />
          </div>
        }
        footer={<KeyRow active={active} />}
      />
    );
  }

  const { word, timing } = scene;
  const n = word.length;
  const { listenEnd, spellStart, correctAt } = timing;
  const correct = lt >= correctAt;
  const cut = !frozen && lt >= scene.durationMs - CUT_MS;

  let active: string | null = null;
  let filled = 0;
  if (lt < listenEnd) {
    const i = Math.floor(lt / LETTER_MS);
    if (lt - i * LETTER_MS < LETTER_ON_MS) active = word[i];
  } else if (lt >= spellStart) {
    filled = Math.min(n, Math.floor((lt - spellStart) / SPELL_MS) + 1);
    const last = filled - 1;
    if (last < n && lt - (spellStart + last * SPELL_MS) < SPELL_FLASH_MS) active = word[last];
  }

  // 1.04 → 1 over CORRECT_POP_MS, eased out, as a pure function of lt
  const pop = correct ? Math.min(1, (lt - correctAt) / CORRECT_POP_MS) : 1;
  const scale = correct ? 1 + 0.04 * (1 - pop) * (1 - pop) : 1;

  const status = correct ? (
    <span className={`${PHOSPHOR.accent} ${PHOSPHOR.glow}`}>
      CORRECT · +{basePointsFor({ id: word, word })} PTS
    </span>
  ) : lt >= spellStart ? (
    <span>SPELL IT BACK</span>
  ) : (
    <span>
      LISTEN<span className={frozen ? '' : 'animate-blink'}>_</span>
    </span>
  );

  return (
    <Screen
      hud={
        <>
          {status}
          {muted}
        </>
      }
      stage={
        <div className={`flex h-full items-center justify-center ${cut ? 'opacity-0' : ''}`}>
          <div className="flex justify-center gap-2 sm:gap-3" style={{ transform: scale === 1 ? undefined : `scale(${scale})` }}>
            {[...word].map((ch, i) => (
              <span
                key={i}
                className={`flex h-[1.3em] w-[1.1em] items-end justify-center border-b-2 pb-1 text-center font-display text-[clamp(34px,5vw,60px)] leading-none text-fg ${PHOSPHOR.glow} ${
                  correct ? 'border-brand' : 'border-white/25'
                }`}
              >
                {i < filled ? ch : ''}
              </span>
            ))}
          </div>
        </div>
      }
      footer={<KeyRow active={cut ? null : active} />}
    />
  );
}
