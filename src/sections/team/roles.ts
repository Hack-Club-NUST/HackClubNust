/**
 * What each office actually involves, in plain words — shown in the badge's
 * modal. This describes the role, not the person: no invented bios, hobbies or
 * quotes. When someone wants a line of their own, add it as `note` on their
 * entry in src/team.ts rather than editing these.
 */
export interface RoleCopy {
  /** One line, the role in a sentence. */
  line: string;
  /** Two short paragraphs: what the job really is. */
  job: [string, string];
  /** What to come to this person for. */
  askFor: string[];
}

export const ROLE_COPY: Record<string, RoleCopy> = {
  President: {
    line: 'If it carries the club’s name, it went past this desk.',
    job: [
      'The President sets where the club is heading this tenure, and then does the unglamorous part: turning that into dates, rooms, permissions and people. It’s the role that talks to faculty, the administration and partners on the club’s behalf.',
      'It’s also the one that says yes to a wild idea — and then quietly makes sure there’s a plan, a budget and a team behind it before anyone notices how close it came to not happening.',
    ],
    askFor: ['A big idea that needs a yes', 'Partnering with the club', 'Anything that goes out under the club’s name'],
  },
  'Vice President': {
    line: 'The person who knows where everything stands.',
    job: [
      'The Vice President keeps the machine running while the President is out front. That means sitting between the teams — tech, media, events, HR — and catching the gaps before they turn into problems on the day.',
      'When the President can’t be in the room, the Vice President is the room. Most of the job is invisible when it goes well, which is exactly how you know it’s going well.',
    ],
    askFor: ['Where a project or event stands', 'Getting unblocked between two teams', 'Figuring out which team you belong on'],
  },
  Secretary: {
    line: 'If it isn’t written down, it didn’t happen.',
    job: [
      'The Secretary is the club’s memory. Meeting notes, decisions, who said they’d do what and by when — all of it lands here, so nothing important lives only in someone’s head or a lost chat.',
      'It’s also the paperwork that makes events possible: room bookings, permission letters, official emails to the department. Nobody claps for a booked seminar hall, but there’s no event without one.',
    ],
    askFor: ['A room booking or a permission letter', 'What was decided in the last meeting', 'Official letters and emails for the club'],
  },
  Treasurer: {
    line: 'Every rupee in, every rupee out, every receipt.',
    job: [
      'The Treasurer looks after the club’s money: event budgets, sponsorship coming in, prizes and expenses going out, and the receipts that prove where all of it went.',
      'It’s the role that asks “how much will that cost?” before everyone falls in love with a plan — not to say no, but so that when the club says yes, it can actually pay for it.',
    ],
    askFor: ['Putting a budget together for your event', 'Reimbursements and receipts', 'How sponsorship money gets used'],
  },
  'Press Secretary': {
    line: 'The voice you hear when the club speaks.',
    job: [
      'The Press Secretary decides how the club sounds to everyone outside it: announcements, captions, posts and anything the press or the university reads about us.',
      'Good events disappear if nobody hears about them. This role makes sure the work the club does gets seen — and that it’s said clearly, on time, and in a way people actually want to read.',
    ],
    askFor: ['Getting your event announced', 'Wording a post or an announcement', 'Showing off something your team built'],
  },
  'Tech Secretary': {
    line: 'If it has a screen and the club made it, it went through here.',
    job: [
      'The Tech Secretary leads the club’s technical side: this website, the games, and the infrastructure that runs on event day — registrations, CTF challenges, leaderboards, the HackPass desk.',
      'It’s also the role that turns members into builders: running workshops, reviewing code, and making sure what the club ships actually works when a room full of people starts using it at once.',
    ],
    askFor: ['Building something for an event', 'The website, the games or the club’s tools', 'Learning to ship your first real project'],
  },
};
