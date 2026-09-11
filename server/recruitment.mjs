/**
 * Executive recruitment — the portfolios, the field limits and the validator.
 *
 * Pure: no database, no Express. `server/app.mjs` calls `validateApplication`
 * and hands the clean object to the repo; `src/recruitment.ts` mirrors the
 * portfolio list for the form. The server is the authority on both.
 */

export const PORTFOLIOS = [
  {
    id: 'tech',
    name: 'Tech',
    blurb: 'Builds what the club ships. Workshops, tooling, the site, the games.',
  },
  {
    id: 'media',
    name: 'Media',
    blurb: 'Design, film, edit, post. Everything the club looks and sounds like.',
  },
  {
    id: 'hr',
    name: 'HR',
    blurb: 'The people side. Onboarding, teams, culture, keeping members around.',
  },
  {
    id: 'em',
    name: 'Event Management',
    blurb: 'Hackathons, stalls and sessions — logistics, sponsors, the day itself.',
  },
];

export const PORTFOLIO_IDS = PORTFOLIOS.map((p) => p.id);

/** NUST schools, Islamabad campus first. 'other' keeps the list from being a wall. */
export const SCHOOLS = [
  'SEECS',
  'SMME',
  'SCEE',
  'SCME',
  'S3H',
  'SNS',
  'NBS',
  'ASAB',
  'IGIS',
  'SADA',
  'NIT',
  'Other',
];

export const YEARS = ['1st', '2nd', '3rd', '4th', 'Postgrad'];

/** Recruitment can be closed without a redeploy by setting RECRUITMENT_CLOSED=1. */
export function recruitmentIsOpen() {
  const flag = String(process.env.RECRUITMENT_CLOSED ?? '').toLowerCase();
  return !(flag === '1' || flag === 'true' || flag === 'yes');
}

export const LIMITS = {
  name: [2, 60],
  email: [5, 120],
  phone: [0, 24],
  link: [0, 200],
  why: [40, 800],
  experience: [0, 800],
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-() ]{7,24}$/;

const text = (value) => String(value ?? '').trim();

/**
 * Returns `{ value }` on success or `{ error }` with a message meant to be shown
 * to the applicant verbatim. Every string is length-capped here rather than
 * relying on the client's maxLength, which a user can simply remove.
 */
export function validateApplication(body) {
  const name = text(body?.name);
  if (name.length < LIMITS.name[0] || name.length > LIMITS.name[1])
    return { error: 'Name must be 2–60 characters.' };

  const email = text(body?.email).toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > LIMITS.email[1])
    return { error: 'That email does not look right.' };

  const portfolio = text(body?.portfolio).toLowerCase();
  if (!PORTFOLIO_IDS.includes(portfolio)) return { error: 'Pick a portfolio.' };

  const phone = text(body?.phone);
  if (phone && !PHONE_RE.test(phone)) return { error: 'That phone number does not look right.' };

  const school = text(body?.school);
  if (!SCHOOLS.includes(school)) return { error: 'Pick your school.' };

  const year = text(body?.year);
  if (!YEARS.includes(year)) return { error: 'Pick your year.' };

  const link = text(body?.link);
  if (link.length > LIMITS.link[1]) return { error: 'That link is too long.' };
  if (link && !/^https?:\/\//i.test(link))
    return { error: 'Links must start with http:// or https://' };

  const why = text(body?.why);
  if (why.length < LIMITS.why[0])
    return { error: `Tell us a little more — at least ${LIMITS.why[0]} characters.` };
  if (why.length > LIMITS.why[1]) return { error: 'Keep it under 800 characters.' };

  const experience = text(body?.experience).slice(0, LIMITS.experience[1]);

  return {
    value: { name, email, portfolio, phone, school, year, link, why, experience },
  };
}

export const APPLICATION_STATUSES = ['new', 'shortlisted', 'accepted', 'rejected'];
