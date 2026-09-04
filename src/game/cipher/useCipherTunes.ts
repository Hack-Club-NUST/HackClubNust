import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchLeaderboard, registerPlayer, submitRun } from '../api';
import { savePlayer } from '../storage';
import type { LeaderboardEntry, Phase, Player, Standing } from '../types';
import { TuneEngine } from './audio';
import { buildTune, normalise, type ScaleNote } from './cipher';
import {
  buildCipherRun,
  cipherRankFor,
  limitFor,
  scoreCipherRound,
  type CipherRound,
  type CipherRoundResult,
} from './scoring';

const TICK_MS = 100;
const GAME = 'cipher-tunes' as const;

export interface ActiveNote {
  part: 'row' | 'col';
  note: ScaleNote;
}

export function useCipherTunes() {
  const [phase, setPhase] = useState<Phase>('gate');
  const [player, setPlayer] = useState<Player | null>(null);
  const [standing, setStanding] = useState<Standing | null>(null);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [run, setRun] = useState<CipherRound[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<CipherRoundResult[]>([]);
  const [msLeft, setMsLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const [guess, setGuess] = useState('');
  const [replays, setReplays] = useState(0);
  const [hints, setHints] = useState(0);
  const [earMode, setEarMode] = useState(false);
  const [slow, setSlow] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNote, setActiveNote] = useState<ActiveNote | null>(null);
  const [audioReady, setAudioReady] = useState(false);

  const engineRef = useRef<TuneEngine | null>(null);
  const answeredRef = useRef(false);

  if (!engineRef.current) engineRef.current = new TuneEngine();
  const engine = engineRef.current;

  useEffect(() => () => engine.dispose(), [engine]);

  const round = run[index] ?? null;
  const limitMs = round ? limitFor(round) : 0;
  const tune = useMemo(
    () => (round ? buildTune(round.answer, { stretch: slow ? 1.45 : 1 }) : null),
    [round, slow]
  );

  const score = results.reduce((sum, r) => sum + r.pointsEarned, 0);
  const correct = results.filter((r) => r.correct).length;
  const combo = results.length ? results[results.length - 1].comboAfter : 0;
  const maxCombo = results.reduce((max, r) => Math.max(max, r.comboAfter), 0);
  const lastResult = results.length ? results[results.length - 1] : null;

  const refreshBoard = useCallback(async () => {
    try {
      const data = await fetchLeaderboard(GAME, 10);
      setBoard(data.entries);
      setPlayerCount(data.players);
      setApiError(null);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Leaderboard unavailable');
    }
  }, []);

  useEffect(() => {
    void refreshBoard();
  }, [refreshBoard]);

  const signIn = useCallback(
    async (name: string, email: string) => {
      setBusy(true);
      setApiError(null);
      try {
        const { player: p, standing: s } = await registerPlayer(name, email, GAME);
        setPlayer(p);
        setStanding(s);
        savePlayer({ id: p.id, name: p.name, email });
        setPhase('intro');
        void refreshBoard();
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Could not sign you in.');
      } finally {
        setBusy(false);
      }
    },
    [refreshBoard]
  );

  /** Audio needs a gesture; every entry point into sound goes through here. */
  const unlockAudio = useCallback(async () => {
    const ok = await engine.unlock();
    setAudioReady(ok);
    return ok;
  }, [engine]);

  const playCurrent = useCallback(() => {
    if (!tune) return;
    setIsPlaying(true);
    setActiveNote(null);
    engine.playTune(tune, {
      onNote: (letterIndex, part) => {
        const motif = tune.letters[letterIndex];
        if (!motif) return;
        setActiveNote({ part, note: part === 'row' ? motif.rowNote : motif.colNote });
      },
      onEnd: () => {
        setIsPlaying(false);
        setActiveNote(null);
        setTimerRunning(true); // the clock starts only once the tune has finished
      },
    });
  }, [engine, tune]);

  const playNote = useCallback(
    (hz: number) => {
      void unlockAudio().then((ok) => {
        if (ok) engine.playNote(hz);
      });
    },
    [engine, unlockAudio]
  );

  /** Plays any word outside a round — used by the tutorial's demo button. */
  const demo = useCallback(
    (word: string) => {
      void unlockAudio().then((ok) => {
        if (!ok) return;
        const demoTune = buildTune(word);
        setIsPlaying(true);
        engine.playTune(demoTune, {
          onNote: (letterIndex, part) => {
            const motif = demoTune.letters[letterIndex];
            if (!motif) return;
            setActiveNote({ part, note: part === 'row' ? motif.rowNote : motif.colNote });
          },
          onEnd: () => {
            setIsPlaying(false);
            setActiveNote(null);
          },
        });
      });
    },
    [engine, unlockAudio]
  );

  const start = useCallback(async () => {
    await unlockAudio();
    setRun(buildCipherRun());
    setIndex(0);
    setResults([]);
    setGuess('');
    setReplays(0);
    setHints(0);
    setSlow(false);
    setPhase('playing');
  }, [unlockAudio]);

  /* Auto-play each round once on arrival. */
  useEffect(() => {
    if (phase !== 'playing' || !tune) return;
    answeredRef.current = false;
    setMsLeft(limitMs);
    setTimerRunning(false);
    const id = setTimeout(() => playCurrent(), 260);
    return () => {
      clearTimeout(id);
      engine.stop();
    };
    // playCurrent changes with `slow`, which must not retrigger the round
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  const submit = useCallback(
    (value: string | null) => {
      if (answeredRef.current || !round) return;
      answeredRef.current = true;
      engine.stop();
      setIsPlaying(false);

      setResults((prev) => {
        const priorCombo = prev.length ? prev[prev.length - 1].comboAfter : 0;
        return [
          ...prev,
          scoreCipherRound({
            round,
            guess: value,
            msLeft,
            replays,
            hints,
            earMode,
            comboBefore: priorCombo,
          }),
        ];
      });
      setTimerRunning(false);
      setPhase('feedback');
    },
    [round, msLeft, replays, hints, earMode, engine]
  );

  const submitRef = useRef(submit);
  submitRef.current = submit;

  useEffect(() => {
    if (phase !== 'playing' || !timerRunning) return;
    const startedAt = Date.now();
    const from = msLeft;

    const id = setInterval(() => {
      const remaining = from - (Date.now() - startedAt);
      if (remaining <= 0) {
        clearInterval(id);
        setMsLeft(0);
        submitRef.current(null);
      } else {
        setMsLeft(remaining);
      }
    }, TICK_MS);

    return () => clearInterval(id);
    // msLeft is the starting value only; re-running on every tick would reset it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timerRunning, index]);

  const replay = useCallback(
    (options: { slower?: boolean } = {}) => {
      if (options.slower) setSlow(true);
      setReplays((n) => n + 1);
      void unlockAudio().then((ok) => {
        if (ok) setTimeout(() => playCurrent(), 60);
      });
    },
    [playCurrent, unlockAudio]
  );

  /** Reveals the next unknown letter of a word straight into the guess. */
  const useHint = useCallback(() => {
    if (!round || round.kind !== 'word') return;
    const answer = round.answer;
    const current = guess.toUpperCase();
    let next = '';
    for (let i = 0; i < answer.length; i++) {
      if (normalise(current[i] ?? '') !== answer[i]) {
        next = current.slice(0, i).padEnd(i, ' ') + answer[i];
        break;
      }
    }
    if (!next) return;
    setHints((n) => n + 1);
    setGuess(next.trimEnd());
  }, [round, guess]);

  const finish = useCallback(
    async (finalResults: CipherRoundResult[]) => {
      setPhase('results');
      if (!player) return;
      const finalCorrect = finalResults.filter((r) => r.correct).length;
      setBusy(true);
      try {
        const res = await submitRun({
          playerId: player.id,
          game: GAME,
          score: finalResults.reduce((sum, r) => sum + r.pointsEarned, 0),
          correct: finalCorrect,
          total: finalResults.length,
          maxCombo: finalResults.reduce((max, r) => Math.max(max, r.comboAfter), 0),
          rankTitle: cipherRankFor(finalCorrect, finalResults.length).title,
        });
        setBoard(res.leaderboard);
        setStanding(res.standing);
        setApiError(null);
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Could not save your run.');
      } finally {
        setBusy(false);
      }
    },
    [player]
  );

  const next = useCallback(() => {
    if (results.length >= run.length) {
      void finish(results);
      return;
    }
    setGuess('');
    setReplays(0);
    setHints(0);
    setSlow(false);
    setIndex((i) => i + 1);
    setPhase('playing');
  }, [results, run.length, finish]);

  const reset = useCallback(() => {
    engine.stop();
    setPhase(player ? 'intro' : 'gate');
    setRun([]);
    setIndex(0);
    setResults([]);
    setGuess('');
  }, [engine, player]);

  return {
    phase, player, standing, board, playerCount, apiError, busy,
    run, index, round, results, lastResult, tune,
    msLeft, limitMs, timerRunning, score, correct, combo, maxCombo,
    guess, setGuess, replays, hints, earMode, setEarMode, slow,
    isPlaying, activeNote, audioReady,
    signIn, start, replay, useHint, submit, next, reset, playNote, unlockAudio, demo,
  };
}
