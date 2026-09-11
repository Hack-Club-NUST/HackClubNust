import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EXPERIENCE_MAX,
  PORTFOLIO_DETAIL,
  WHY_MAX,
  WHY_MIN,
  fetchRecruitment,
  submitApplication,
  type ApplicationDraft,
  type PortfolioId,
  type RecruitmentConfig,
} from '../recruitment';

const EMPTY: ApplicationDraft = {
  name: '',
  email: '',
  phone: '',
  school: '',
  year: '',
  portfolio: '',
  link: '',
  why: '',
  experience: '',
};

const fieldClass =
  'h-12 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 text-[14px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-brand';

const labelClass = 'mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-white/40';

/**
 * Executive recruitment. The portfolio cards are the first choice a student
 * makes — picking one reveals the form, so nobody fills in eight fields before
 * finding out what they are applying for. Everything the form renders (the
 * portfolios, the schools, whether applications are open at all) comes from
 * the API, so the server stays the authority on all of it.
 */
export default function Recruit() {
  const [config, setConfig] = useState<RecruitmentConfig | null>(null);
  const [configError, setConfigError] = useState(false);
  const [draft, setDraft] = useState<ApplicationDraft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ portfolio: PortfolioId; resubmitted: boolean } | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchRecruitment()
      .then(setConfig)
      .catch(() => setConfigError(true));
  }, []);

  const set = <K extends keyof ApplicationDraft>(key: K, value: ApplicationDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setError(null);
  };

  const choosePortfolio = (id: PortfolioId) => {
    set('portfolio', id);
    // Selecting from a card scrolls the form into view; without it the reveal
    // happens below the fold on a phone and reads as nothing having happened.
    window.setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      80
    );
  };

  const whyLength = draft.why.trim().length;
  const canSubmit =
    !busy &&
    draft.portfolio !== '' &&
    draft.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()) &&
    draft.school !== '' &&
    draft.year !== '' &&
    whyLength >= WHY_MIN;

  const send = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const result = await submitApplication(draft);
      setDone({ portfolio: result.portfolio, resubmitted: result.resubmitted });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send that. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const portfolios = config?.portfolios ?? [];
  const open = config?.open ?? true;
  const chosen = portfolios.find((p) => p.id === draft.portfolio) ?? null;

  return (
    <section id="apply" className="relative w-full overflow-hidden bg-ink px-6 py-32">
      {/* a single brand bloom, so the section reads as the page's warm end */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand-grad opacity-[0.12] blur-[140px]" />

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9 }}
        >
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] ${
              open
                ? 'border-brand/50 bg-brand/10 text-brand'
                : 'border-white/15 text-white/40'
            }`}
          >
            {open && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />}
            {open ? 'Applications open' : 'Applications closed'}
          </span>

          <h2 className="mt-8 text-[clamp(28px,6vw,56px)] font-light leading-[1.1] tracking-[-0.02em] text-white">
            Join the exec team.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-[14px] leading-relaxed text-white/45 sm:text-[15px]">
            Four portfolios run this club. Pick the one that fits how you like to work, tell us
            what you would build, and apply right here. No CV, no referral, no interview loop —
            we read every application ourselves.
          </p>
        </motion.div>

        {/* ------------------------------ portfolios ----------------------------- */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {portfolios.map((portfolio, i) => {
            const detail = PORTFOLIO_DETAIL[portfolio.id];
            const selected = draft.portfolio === portfolio.id;
            return (
              <motion.button
                key={portfolio.id}
                type="button"
                onClick={() => choosePortfolio(portfolio.id)}
                disabled={!open}
                aria-pressed={selected}
                className={`group relative flex flex-col rounded-2xl border p-6 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  selected
                    ? 'border-brand/60 bg-brand/[0.07]'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                }`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                    selected ? 'bg-brand-grad' : 'bg-white/[0.06] group-hover:bg-white/10'
                  }`}
                >
                  <i className={`bi ${detail?.icon ?? 'bi-dot'} text-[18px] text-white`} aria-hidden="true" />
                </div>

                <h3 className="mt-5 text-[20px] font-light leading-tight tracking-[-0.01em] text-white">
                  {portfolio.name}
                </h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-white/40">{portfolio.blurb}</p>

                <ul className="mt-5 flex flex-col gap-1.5">
                  {(detail?.work ?? []).map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12px] text-white/35">
                      <span className={selected ? 'text-brand' : 'text-white/25'}>·</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex-1" />

                <span
                  className={`mt-6 text-[11px] uppercase tracking-[0.15em] ${
                    selected ? 'text-brand' : 'text-white/30 group-hover:text-white/50'
                  }`}
                >
                  {selected ? '● Selected' : 'Select →'}
                </span>
              </motion.button>
            );
          })}

          {portfolios.length === 0 && (
            <div className="col-span-full rounded-2xl border border-white/10 p-8 text-center text-[13px] text-white/35">
              {configError
                ? 'Could not load the portfolios. Refresh the page, or reach us on WhatsApp.'
                : 'Loading portfolios…'}
            </div>
          )}
        </div>

        {/* -------------------------------- form -------------------------------- */}
        <div ref={formRef} className="scroll-mt-24">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                className="mt-10 rounded-2xl border border-emerald-400/35 bg-emerald-400/[0.05] p-10 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <i className="bi bi-check2-circle text-[34px] text-emerald-400" aria-hidden="true" />
                <h3 className="mt-4 text-[24px] font-light text-white">
                  {done.resubmitted ? 'Application updated.' : 'Application in.'}
                </h3>
                <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-white/50">
                  {done.resubmitted
                    ? 'You had already applied to this portfolio, so we replaced your earlier answers with these.'
                    : 'We read applications in batches and reply by email. Join the WhatsApp community in the meantime — that is where everything actually happens.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDone(null);
                    setDraft({ ...EMPTY });
                  }}
                  className="mt-7 text-[12px] uppercase tracking-[0.15em] text-white/40 underline-offset-4 transition-colors hover:text-white"
                >
                  Apply to another portfolio
                </button>
              </motion.div>
            ) : chosen && open ? (
              <motion.div
                key="form"
                className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-7 sm:p-10"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45 }}
              >
                <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-[22px] font-light text-white">
                    Applying for <span className="text-brand">{chosen.name}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => set('portfolio', '')}
                    className="text-[11px] uppercase tracking-[0.15em] text-white/30 transition-colors hover:text-white/60"
                  >
                    Change
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="ap-name">
                      Full name
                    </label>
                    <input
                      id="ap-name"
                      className={fieldClass}
                      value={draft.name}
                      maxLength={60}
                      placeholder="Ayesha Khan"
                      onChange={(e) => set('name', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="ap-email">
                      Email
                    </label>
                    <input
                      id="ap-email"
                      type="email"
                      className={fieldClass}
                      value={draft.email}
                      maxLength={120}
                      placeholder="you@school.nust.edu.pk"
                      onChange={(e) => set('email', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="ap-school">
                      School
                    </label>
                    <select
                      id="ap-school"
                      className={`${fieldClass} appearance-none`}
                      value={draft.school}
                      onChange={(e) => set('school', e.target.value)}
                    >
                      <option value="" className="bg-ink">
                        Pick your school
                      </option>
                      {(config?.schools ?? []).map((school) => (
                        <option key={school} value={school} className="bg-ink">
                          {school}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="ap-year">
                      Year
                    </label>
                    <select
                      id="ap-year"
                      className={`${fieldClass} appearance-none`}
                      value={draft.year}
                      onChange={(e) => set('year', e.target.value)}
                    >
                      <option value="" className="bg-ink">
                        Pick your year
                      </option>
                      {(config?.years ?? []).map((year) => (
                        <option key={year} value={year} className="bg-ink">
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="ap-phone">
                      WhatsApp number <span className="normal-case tracking-normal">(optional)</span>
                    </label>
                    <input
                      id="ap-phone"
                      className={fieldClass}
                      value={draft.phone}
                      maxLength={24}
                      placeholder="+92 300 0000000"
                      onChange={(e) => set('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="ap-link">
                      A link <span className="normal-case tracking-normal">(optional)</span>
                    </label>
                    <input
                      id="ap-link"
                      className={fieldClass}
                      value={draft.link}
                      maxLength={200}
                      placeholder="github.com / behance / a drive folder"
                      onChange={(e) => set('link', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label className={labelClass} htmlFor="ap-why">
                    Why this portfolio, and what would you do with it?
                  </label>
                  <textarea
                    id="ap-why"
                    rows={5}
                    maxLength={WHY_MAX}
                    className="w-full resize-y rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-[14px] leading-relaxed text-white outline-none transition-colors placeholder:text-white/25 focus:border-brand"
                    value={draft.why}
                    placeholder="One concrete thing you would build, run or fix in your first month is worth more than a paragraph about passion."
                    onChange={(e) => set('why', e.target.value)}
                  />
                  <div className="mt-1.5 flex justify-between text-[11px] text-white/25">
                    <span className={whyLength > 0 && whyLength < WHY_MIN ? 'text-brand' : ''}>
                      {whyLength < WHY_MIN ? `At least ${WHY_MIN} characters` : 'Good length'}
                    </span>
                    <span>
                      {whyLength}/{WHY_MAX}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <label className={labelClass} htmlFor="ap-exp">
                    Anything you have already made or run{' '}
                    <span className="normal-case tracking-normal">(optional)</span>
                  </label>
                  <textarea
                    id="ap-exp"
                    rows={3}
                    maxLength={EXPERIENCE_MAX}
                    className="w-full resize-y rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-[14px] leading-relaxed text-white outline-none transition-colors placeholder:text-white/25 focus:border-brand"
                    value={draft.experience}
                    placeholder="Side projects, a society role, an event you helped run. Beginners are welcome — say so."
                    onChange={(e) => set('experience', e.target.value)}
                  />
                </div>

                {error && (
                  <p className="mt-5 rounded-xl border border-brand/40 bg-brand/[0.07] px-4 py-3 text-[12.5px] text-white/75">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={!canSubmit}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-brand-grad py-4 text-[14px] font-bold text-white shadow-[0_8px_30px_rgba(235,69,84,0.28)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 disabled:opacity-35 disabled:shadow-none"
                >
                  {busy ? 'Sending…' : `Apply for ${chosen.name}`}
                  {!busy && <i className="bi bi-arrow-right text-[15px]" aria-hidden="true" />}
                </button>

                <p className="mt-4 text-center text-[11.5px] leading-relaxed text-white/25">
                  Your details go to the club's exec team only. Applying to a second portfolio is
                  fine — send the form again with a different one selected.
                </p>
              </motion.div>
            ) : !open ? (
              <motion.div
                key="closed"
                className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-[14px] text-white/45">
                  Exec recruitment is closed for this cycle. Join the WhatsApp community and you
                  will hear the moment it reopens.
                </p>
              </motion.div>
            ) : (
              <motion.p
                key="prompt"
                className="mt-10 text-center text-[13px] text-white/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Pick a portfolio above to open the form.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
