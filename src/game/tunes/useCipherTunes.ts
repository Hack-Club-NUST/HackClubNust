import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchLeaderboard, registerPlayer, submitRun } from '../api';
import { savePlayer } from '../storage';
import type { LeaderboardEntry, Player, Standing } from '../types';
import { LETTERS, isLetter, type Letter } from './alphabet';
import { TuneBank } from './audio';
import { buildRun, limitFor, maxHintsFor, rankFor, scoreRound, type TuneRound, type TuneRoundResult } from './scoring';

const TICK_MS = 100;
const GAME = 'cipher-tunes' as const;

export type TunePhase = 'gate' | 'loading' | 'practice' | 'playing' | 'feedback' | 'results';

export function useCipherTunes() {
  const [phase, setPhase] = useState<TunePhase>('gate');
  const [player, setPlayer] = useState<Player | null>(null);
  const [standing, setStanding] = useState<Standing | null>(null);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [loadProgress, setLoadProgress] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  const [run, setRun] = useState<TuneRound[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<TuneRoundResult[]>([]);
  const [msLeft, setMsLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const [guess, setGuess] = useState('');
  const [replays, setReplays] = useState(0);
  const [hints, setHints] = useState(0);
  const [revealed, setRevealed] = useState<number[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLetterIndex, setActiveLetterIndex] = useState(-1);
  const [previewLetter, setPreviewLetter] = useState<Letter | null>(null);

  const bankRef = useRef<TuneBank | null>(null);
  if (!bankRef.current) bankRef.current = new TuneBank();
  const bank = bankRef.current;
  const answeredRef = useRef(false);

  useEffect(() => () => bank.dispose(), [bank]);

  const round = run[index] ?? null;
  const limitMs = round ? limitFor(round) : 0;
  const score = results.reduce((sum, r) => sum + r.pointsEarned, 0);
  const correct = results.filter((r) => r.correct).length;
  const combo = results.length ? results[results.length - 1].comboAfter : 0;
  const maxCombo = results.reduce((m, r) => Math.max(m, r.comboAfter), 0);
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

  /** Sign in, then immediately start fetching audio — the gesture unlocks it. */
  const signIn = useCallback(
    async (name: string, email: string) => {
      setBusy(true);
      setApiError(null);
      try {
        const { player: p, standing: s } = await registerPlayer(name, email, GAME);
        setPlayer(p);
        setStanding(s);
        savePlayer({ id: p.id, name: p.name, email });
        setPhase('loading');
        void refreshBoard();

        await bank.unlock();
        await bank.loadAll((done, total) => setLoadProgress(done / total));
        setPhase('practice');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not sign you in.';
        if (message.toLowerCase().includes('tune')) {
          setAudioError(message);
          setPhase('practice');
        } else {
          setApiError(message);
          setPhase('gate');
        }
      } finally {
        setBusy(false);
      }
    },
    [bank, refreshBoard]
  );

  const playLetter = useCallback(
    (letter: Letter) => {
      setPreviewLetter(letter);
      void bank.unlock().then(() => {
        bank.playLetter(letter, () => setPreviewLetter(null));
      });
    },
    [bank]
  );

  const playFullTune = useCallback(
    (letter: Letter) => {
      setPreviewLetter(letter);
      void bank.unlock().then(() => bank.playFull(letter, () => setPreviewLetter(null)));
    },
    [bank]
  );

  const playWord = useCallback(
    (word: string, options: { countsAsReplay?: boolean } = {}) => {
      if (options.countsAsReplay) setReplays((n) => n + 1);
      setIsPlaying(true);
      void bank.unlock().then(() => {
        bank.playWord(word, {
          onLetter: (i) => setActiveLetterIndex(i),
          onEnd: () => {
            setIsPlaying(false);
            setActiveLetterIndex(-1);
            setTimerRunning(true); // the clock waits for the melody to finish
          },
        });
      });
    },
    [bank]
  );

  const startRun = useCallback(() => {
    bank.stop();
    setRun(buildRun());
    setIndex(0);
    setResults([]);
    setGuess('');
    setReplays(0);
    setHints(0);
    setRevealed([]);
    setPhase('playing');
  }, [bank]);

  /* Each round auto-plays once on arrival so nobody has to find a play button. */
  useEffect(() => {
    if (phase !== 'playing' || !round) return;
    answeredRef.current = false;
    setMsLeft(limitMs);
    setTimerRunning(false);
    const id = setTimeout(() => playWord(round.word), 420);
    return () => {
      clearTimeout(id);
      bank.stop();
      setIsPlaying(false);
    };
    // playWord identity is stable enough; re-running on it would replay the round
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  const submit = useCallback(
    (value: string | null) => {
      if (answeredRef.current || !round) return;
      answeredRef.current = true;
      bank.stop();
      setIsPlaying(false);
      setActiveLetterIndex(-1);
      setTimerRunning(false);

      setResults((prev) => {
        const priorCombo = prev.length ? prev[prev.length - 1].comboAfter : 0;
        return [
          ...prev,
          scoreRound({ round, guess: value, msLeft, replays, hints, comboBefore: priorCombo }),
        ];
      });
      setPhase('feedback');
    },
    [round, msLeft, replays, hints, bank]
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
    // msLeft is only the starting value here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timerRunning, index]);

  /* ------------------------------- guessing ------------------------------- */

  const appendLetter = useCallback(
    (letter: Letter) => {
      if (!round) return;
      setGuess((g) => (g.length >= round.word.length ? g : g + letter));
    },
    [round]
  );

  const backspace = useCallback(() => {
    if (!round) return;
    setGuess((g) => {
      // never delete back over a letter the hint revealed
      const next = g.slice(0, -1);
      return next.length < (revealed.length ? Math.max(...revealed) + 1 : 0) ? g : next;
    });
  }, [round, revealed]);

  const clearGuess = useCallback(() => {
    if (!round) return;
    const kept = [...round.word].map((ch, i) => (revealed.includes(i) ? ch : ' '));
    const trimmed = kept.join('').replace(/\s+$/, '');
    setGuess(trimmed.includes(' ') ? '' : trimmed);
  }, [round, revealed]);

  /** Reveals the first letter the player has not yet got right. */
  const useHint = useCallback(() => {
    if (!round || hints >= maxHintsFor(round)) return;
    const word = round.word;
    for (let i = 0; i < word.length; i++) {
      if (guess[i] !== word[i]) {
        setHints((n) => n + 1);
        setRevealed((r) => [...r, i]);
        setGuess(word.slice(0, i + 1));
        return;
      }
    }
  }, [round, guess, hints]);

  /* -------------------------------- flow --------------------------------- */

  const finish = useCallback(
    async (finalResults: TuneRoundResult[]) => {
      setPhase('results');
      if (!player) return;
      const finalCorrect = finalResults.filter((r) => r.correct).length;
      setBusy(true);
      try {
        const res = await submitRun({
          playerId: player.id,
          game: GAME,
          score: finalResults.reduce((s, r) => s + r.pointsEarned, 0),
          correct: finalCorrect,
          total: finalResults.length,
          maxCombo: finalResults.reduce((m, r) => Math.max(m, r.comboAfter), 0),
          rankTitle: rankFor(finalCorrect, finalResults.length).title,
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
    setRevealed([]);
    setIndex((i) => i + 1);
    setPhase('playing');
  }, [results, run.length, finish]);

  const backToPractice = useCallback(() => {
    bank.stop();
    setPhase('practice');
  }, [bank]);

  const reset = useCallback(() => {
    bank.stop();
    setPhase(player ? (bank.ready ? 'practice' : 'loading') : 'gate');
    setRun([]);
    setIndex(0);
    setResults([]);
    setGuess('');
  }, [bank, player]);

  return {
    phase, player, standing, board, playerCount, apiError, busy,
    loadProgress, audioError, ready: bank.ready,
    run, index, round, results, lastResult,
    msLeft, limitMs, timerRunning, score, correct, combo, maxCombo,
    guess, replays, hints, revealed,
    maxHints: round ? maxHintsFor(round) : 0,
    isPlaying, activeLetterIndex, previewLetter, letters: LETTERS,
    signIn, startRun, playWord, playLetter, playFullTune,
    appendLetter, backspace, clearGuess, useHint, submit, next, reset, backToPractice,
    isLetter,
  };
}
