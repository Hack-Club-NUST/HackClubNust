/** "Tuesday" + "6 October 2026" → "TUE 6 OCT 2026". Formatting only; the facts are ORIENTATION's. */
export function formatTicketDate(day: string, date: string): string {
  const [d, month, year] = date.split(' ');
  return `${day.slice(0, 3)} ${d} ${month.slice(0, 3)} ${year}`.toUpperCase();
}

/** The spine / headline word for each pillar. Formatting of `pillar.title`, not new copy. */
export const DISPLAY_WORD: Record<string, string> = {
  Hackathons: 'HACKATHONS',
  Workshops: 'WORKSHOPS',
  'Tech & cyber events': 'TECH & CYBER',
};
