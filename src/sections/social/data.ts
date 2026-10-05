import { INSTAGRAM } from '../../events';

export { INSTAGRAM };
export const HANDLE = 'hackclub.nust';

export const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;

export interface Reel {
  id: string;
  /** The reel's own on-screen title, so the caption says what the clip shows. */
  caption: string;
  /** The clip already prints its caption at the bottom; don't print ours over it. */
  captionInVideo?: boolean;
  src: string;
  poster: string;
}

/**
 * Reels from @hackclub.nust. The files in public/reels/ are 12-second, silent,
 * 540×960 previews — the full reel, with sound, is on Instagram, which is
 * where every card links.
 */
export const REELS: Reel[] = [
  {
    id: 'huddle',
    caption: 'Heads together, mid-event.',
    src: '/reels/huddle.mp4',
    poster: '/reels/huddle.webp',
  },
  {
    id: 'hackathon-v2',
    caption: 'Hackathon v2, on screen.',
    src: '/reels/hackathon-v2.mp4',
    poster: '/reels/hackathon-v2.webp',
  },
  {
    id: 'locked-in',
    caption: 'The participants are locked in!!',
    src: '/reels/locked-in.mp4',
    poster: '/reels/locked-in.webp',
  },
  {
    id: 'brain-cpp',
    caption: 'Team name: Brain.cpp',
    src: '/reels/brain-cpp.mp4',
    poster: '/reels/brain-cpp.webp',
  },
  {
    id: 'feedback',
    caption: 'Participants’ feedback.',
    src: '/reels/feedback.mp4',
    poster: '/reels/feedback.webp',
  },
  {
    id: 'president',
    caption: 'President leading the game.',
    src: '/reels/president.mp4',
    poster: '/reels/president.webp',
  },
  {
    id: 'codefest-21',
    caption: 'CodeFest’21 is about to start in a few minutes.',
    captionInVideo: true,
    src: '/reels/codefest-21.mp4',
    poster: '/reels/codefest-21.webp',
  },
];

/** The closing card's backdrop: a frame from the club's cake reel. */
export const FOLLOW_BACKDROP = '/reels/cake.webp';
