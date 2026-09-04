import { AnimatePresence, motion } from 'framer-motion';
import SampleView from './SampleView';
import TimerBar from './TimerBar';
import type { AnswerValue, Question, RoundResult } from '../types';

interface RoundScreenProps {
  question: Question;
  index: number;
  total: number;
  score: number;
  combo: number;
  msLeft: number;
  limitMs: number;
  isFeedback: boolean;
  lastResult: RoundResult | null;
  onAnswer: (value: AnswerValue) => void;
  onNext: () => void;
}

const KIND_LABEL = { text: 'prose', code: 'code', image: 'image' } as const;

export default function RoundScreen({
  question,
  index,
  total,
  score,
  combo,
  msLeft,
  limitMs,
  isFeedback,
  lastResult,
  onAnswer,
  onNext,
}: RoundScreenProps) {
  const isLast = index === total - 1;
  const aiSample = question.mode === 'single' ? question.sample : question.options[question.aiIndex];
  const answeredWith = lastResult?.answer ?? null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-5 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-white/40">
        <span className="tabular-nums">
          Round {index + 1} / {total}
        </span>
        <div className="flex items-center gap-3">
          {combo >= 2 && (
            <motion.span
              key={combo}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-brand"
            >
              {combo}x
            </motion.span>
          )}
          <span className="tabular-nums text-white/70">{score} pts</span>
          <span className="rounded border border-white/10 px-2 py-0.5 uppercase tracking-[0.12em] text-white/30">
            {KIND_LABEL[question.kind]}
          </span>
          <span className="rounded border border-white/10 px-2 py-0.5 uppercase tracking-[0.12em] text-white/30">
            {question.difficulty}
          </span>
          {question.mode === 'compare' && (
            <span className="rounded border border-brand/40 px-2 py-0.5 uppercase tracking-[0.12em] text-brand">
              compare
            </span>
          )}
        </div>
      </div>

      <TimerBar msLeft={isFeedback ? (lastResult?.msLeft ?? 0) : msLeft} limitMs={limitMs} />

      <p className="text-[13px] text-white/50 sm:text-[14px]">
        {question.mode === 'single'
          ? 'Did a person or a model make this?'
          : 'One of these came from a model. Which one?'}
      </p>

      {question.mode === 'single' ? (
        <SampleView sample={question.sample} showCredit={isFeedback} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {question.options.map((option, i) => {
            const isAiOption = i === question.aiIndex;
            const picked = answeredWith === i;
            const border = !isFeedback
              ? 'border-white/10'
              : isAiOption
                ? 'border-emerald-400/60'
                : picked
                  ? 'border-brand/60'
                  : 'border-white/10';
            return (
              <button
                key={option.id}
                type="button"
                disabled={isFeedback}
                onClick={() => onAnswer(i as 0 | 1)}
                className={`overflow-hidden rounded-xl border text-left transition-colors ${border} ${
                  isFeedback ? 'cursor-default' : 'hover:border-brand'
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.15em]">
                  <span className="text-white/40">Option {i === 0 ? 'A' : 'B'}</span>
                  {isFeedback ? (
                    <span className={isAiOption ? 'text-emerald-400' : 'text-white/30'}>
                      {isAiOption ? 'the model' : 'the person'}
                    </span>
                  ) : (
                    <span className="text-white/25">[{i + 1}]</span>
                  )}
                </div>
                <SampleView sample={option} compact showCredit={isFeedback} />
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!isFeedback ? (
          question.mode === 'single' ? (
            <motion.div
              key="choices"
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <button
                type="button"
                onClick={() => onAnswer('ai')}
                className="group flex h-16 flex-col items-center justify-center rounded-xl border border-white/15 transition-colors hover:border-brand hover:bg-brand/10"
              >
                <span className="text-[15px] font-bold text-white sm:text-[17px]">AI</span>
                <span className="text-[11px] text-white/35 group-hover:text-white/60">[A]</span>
              </button>
              <button
                type="button"
                onClick={() => onAnswer('human')}
                className="group flex h-16 flex-col items-center justify-center rounded-xl border border-white/15 transition-colors hover:border-white/60 hover:bg-white/5"
              >
                <span className="text-[15px] font-bold text-white sm:text-[17px]">HUMAN</span>
                <span className="text-[11px] text-white/35 group-hover:text-white/60">[H]</span>
              </button>
            </motion.div>
          ) : null
        ) : (
          lastResult && (
            <motion.div
              key="feedback"
              className={`rounded-xl border p-5 sm:p-6 ${
                lastResult.correct
                  ? 'border-emerald-400/40 bg-emerald-400/[0.06]'
                  : 'border-brand/40 bg-brand/[0.06]'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`text-[15px] font-bold sm:text-[17px] ${
                    lastResult.correct ? 'text-emerald-400' : 'text-brand'
                  }`}
                >
                  {lastResult.correct
                    ? 'Correct'
                    : lastResult.answer === null
                      ? 'Out of time'
                      : 'Wrong'}
                  <span className="ml-2 font-normal text-white/50">
                    {question.mode === 'single'
                      ? `— this was ${question.sample.isAI ? 'AI' : 'human'}`
                      : `— ${question.aiIndex === 0 ? 'A' : 'B'} was the model`}
                  </span>
                </span>

                {lastResult.correct && (
                  <span className="text-[13px] tabular-nums text-white/60">
                    +{lastResult.basePoints}
                    {lastResult.speedBonus > 0 && (
                      <span className="text-white/35"> +{lastResult.speedBonus} speed</span>
                    )}
                    {lastResult.comboBonus > 0 && (
                      <span className="text-brand"> +{lastResult.comboBonus} streak</span>
                    )}
                  </span>
                )}
              </div>

              <p className="mt-4 text-[13px] leading-relaxed text-white/60 sm:text-[14px]">
                <span className="text-white/35">The tell — </span>
                {aiSample.tell}
              </p>

              <button
                type="button"
                onClick={onNext}
                autoFocus
                className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white text-[14px] font-bold text-ink transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLast ? 'See results' : 'Next round'}
                <span className="text-[12px] font-normal text-ink/50">[Enter]</span>
              </button>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
