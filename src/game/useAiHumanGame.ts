import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchLeaderboard, registerPlayer, submitRun } from './api';
import { SAMPLES } from './data/samples';
import { buildRun, limitFor, rankFor, scoreRound } from './scoring';
import { loadPlayer, savePlayer } from './storage';
import type {
  AnswerValue,
  LeaderboardEntry,
  Phase,
  Player,
  Question,
  RoundResult,
  Standing,
} from './types';
import type { HackPassProgress, HackPassStatus } from './hackpass';

const TICK_MS = 100;

export function useAiHumanGame() {
  const [phase, setPhase] = useState<Phase>('gate');
  const [player, setPlayer] = useState<Player | null>(null);
  const [standing, setStanding] = useState<Standing | null>(null);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [hackpassProgress, setHackpassProgress] = useState<HackPassProgress | null>(null);
  const [hackpass, setHackpass] = useState<HackPassStatus | null>(null);
  const [hackpassJustIssued, setHackpassJustIssued] = useState(false);

  const [run, setRun] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [msLeft, setMsLeft] = useState(0);

  const answeredRef = useRef(false);

  const question = run[index] ?? null;
  const limitMs = question ? limitFor(question) : 0;
  const score = results.reduce((sum, r) => sum + r.pointsEarned, 0);
  const correct = results.filter((r) => r.correct).length;
  const combo = results.length ? results[results.length - 1].comboAfter : 0;
  const maxCombo = results.reduce((max, r) => Math.max(max, r.comboAfter), 0);
  const lastResult = results.length ? results[results.length - 1] : null;

  const refreshBoard = useCallback(async () => {
    try {
      const data = await fetchLeaderboard('ai-human', 10);
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

  /** Gate: name + email, then straight to the intro. */
  const signIn = useCallback(
    async (name: string, email: string) => {
      setBusy(true);
      setApiError(null);
      try {
        const res = await registerPlayer(name, email, 'ai-human');
        setPlayer(res.player);
        setStanding(res.standing);
        setHackpassProgress(res.hackpassProgress);
        setHackpass(res.hackpass);
        setHackpassJustIssued(res.hackpassJustIssued);
        savePlayer({ id: res.player.id, name: res.player.name, email });
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

  const start = useCallback(() => {
    setRun(buildRun(SAMPLES));
    setIndex(0);
    setResults([]);
    setPhase('playing');
  }, []);

  const answer = useCallback(
    (value: AnswerValue | null, remaining: number) => {
      if (answeredRef.current) return;
      answeredRef.current = true;

      setResults((prev) => {
        const current = run[index];
        if (!current) return prev;
        const priorCombo = prev.length ? prev[prev.length - 1].comboAfter : 0;
        return [...prev, scoreRound(current, value, remaining, priorCombo)];
      });
      setPhase('feedback');
    },
    [run, index]
  );

  const answerRef = useRef(answer);
  answerRef.current = answer;

  /* Per-round wall-clock timer; the limit varies by question, so it restarts per index. */
  useEffect(() => {
    if (phase !== 'playing' || !question) return;
    const limit = limitFor(question);
    const startedAt = Date.now();
    setMsLeft(limit);
    answeredRef.current = false;

    const id = setInterval(() => {
      const remaining = limit - (Date.now() - startedAt);
      if (remaining <= 0) {
        clearInterval(id);
        setMsLeft(0);
        answerRef.current(null, 0);
      } else {
        setMsLeft(remaining);
      }
    }, TICK_MS);

    return () => clearInterval(id);
  }, [phase, index, question]);

  const finish = useCallback(
    async (finalResults: RoundResult[]) => {
      setPhase('results');
      if (!player) return;

      const finalCorrect = finalResults.filter((r) => r.correct).length;
      setBusy(true);
      try {
        const res = await submitRun({
          playerId: player.id,
          game: 'ai-human',
          score: finalResults.reduce((sum, r) => sum + r.pointsEarned, 0),
          correct: finalCorrect,
          total: finalResults.length,
          maxCombo: finalResults.reduce((max, r) => Math.max(max, r.comboAfter), 0),
          rankTitle: rankFor(finalCorrect, finalResults.length).title,
        });
        setBoard(res.leaderboard);
        setStanding(res.standing);
        setHackpassProgress(res.hackpassProgress);
        setHackpass(res.hackpass);
        setHackpassJustIssued(res.hackpassJustIssued);
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
    setIndex((i) => i + 1);
    setPhase('playing');
  }, [results, run.length, finish]);

  const reset = useCallback(() => {
    setPhase(player ? 'intro' : 'gate');
    setRun([]);
    setIndex(0);
    setResults([]);
  }, [player]);

  return {
    phase,
    player,
    standing,
    board,
    playerCount,
    apiError,
    busy,
    run,
    index,
    question,
    results,
    lastResult,
    msLeft,
    limitMs,
    score,
    correct,
    combo,
    maxCombo,
    remembered: loadPlayer(),
    hackpassProgress,
    hackpass,
    hackpassJustIssued,
    signIn,
    start,
    answer,
    next,
    reset,
    refreshBoard,
  };
}
