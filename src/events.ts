/**
 * What Hack Club NUST itself runs — the club's own events, not HQ's.
 *
 * Every line here is a claim about something that happened, sourced from the
 * club's Instagram (@hackclub.nust) and PKCERT's event page. When an event
 * happens, add it; when you cannot point at where a detail came from, leave it
 * out rather than guessing.
 */

export const INSTAGRAM = 'https://instagram.com/hackclub.nust';

/** NHC Orientation 26–27, as announced on the poster. */
export const ORIENTATION = {
  name: 'NHC Orientation',
  edition: '26–27',
  day: 'Tuesday',
  date: '6 October 2026',
  time: '2:00 – 5:00 PM',
  venue: 'RIMMS Seminar Hall',
  campus: 'NUST H‑12, Islamabad', // non-breaking hyphen keeps H-12 on one line
  poster: '/events/nhc-orientation-26.webp',
  pitch:
    'A world of curious minds, wild ideas, and people ready to build something new together.',
  lines: ['Spawn in.', 'Grab your squad.', "Let's build."],
  art: ['ayesha.1207_', 'aswaforreal'],
  post: 'https://www.instagram.com/p/DeC5HAwoSzU/',
  /** Google Calendar "add event" link, in PKT (UTC+5) as UTC. */
  calendar:
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=NHC%20Orientation%2026%E2%80%9327%20%E2%80%94%20Hack%20Club%20NUST' +
    '&dates=20261006T090000Z/20261006T120000Z' +
    '&location=RIMMS%20Seminar%20Hall%2C%20NUST%20H-12%2C%20Islamabad' +
    '&details=Hack%20Club%20NUST%20orientation.%20Spawn%20in.%20Grab%20your%20squad.%20Let%27s%20build.',
};

/** The three things the club runs, in the order the club leads with them. */
export const PILLARS = [
  {
    icon: 'bi-flag',
    title: 'Hackathons',
    body: 'Our own, start to finish. From the NHC Hackathon to The Cyber Hackathon ’26, a national CTF run with National CERT. Build something against the clock, then put it in front of a room.',
  },
  {
    icon: 'bi-tools',
    title: 'Workshops',
    body: 'Hands-on sessions run by members and the people we bring in. You leave with something running on your own machine, not a page of notes.',
  },
  {
    icon: 'bi-shield-lock',
    title: 'Tech & cyber events',
    body: 'CTFs, talks and ceremonies with industry and government. NCERT, DIGIINN360, Hack The Box and Hackviser have all backed events we organised.',
  },
];

/** The flagship, told in full. Figures from pkcert.gov.pk and our own posts. */
export const CYBER_HACKATHON = {
  name: 'The Cyber Hackathon ’26',
  kicker: 'Flagship · August–September 2026',
  poster: '/events/cyber-hackathon-26.webp',
  summary:
    'A national Capture the Flag competition: red- and blue-team challenges, teams of up to five from across Pakistan, played online on 18 August. Organised by Hack Club NUST, co-organised with NUST, DIGIINN360 and National CERT.',
  facts: [
    { label: 'Prize pool', value: 'PKR 275,000' },
    { label: 'First place', value: 'PKR 150,000' },
    { label: 'Format', value: 'Online CTF' },
    { label: 'Teams', value: 'Up to 5' },
  ],
  partners: ['NUST', 'National CERT', 'DIGIINN360', 'Hack The Box', 'Hackviser'],
  closing:
    'Closing ceremony at SEECS on 8 September 2026: a keynote from DG NCERT Dr. Haider Abbas, a shield from Principal SEECS Dr. Ajmal Khan, and the grand prize announcement.',
  post: 'https://www.instagram.com/p/DdoGFQUiFQ_/',
};

/**
 * The rest of the record. Names as the club files them on Instagram; detail
 * only where there is a source for it.
 */
export const RECORD = [
  { name: 'NUST Olympiad hackathon', detail: '150+ students from across Pakistan, on web development and AI tracks.' },
  { name: 'NHC Hackathon', detail: null },
  { name: 'NHC × NArC', detail: null },
  { name: 'Orientation ’25', detail: null },
  { name: 'CloudSpace', detail: null },
  { name: 'Hack Club Day', detail: null },
  { name: 'CodeFest ’21', detail: null },
];
