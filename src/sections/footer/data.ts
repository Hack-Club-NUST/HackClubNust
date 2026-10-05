import { INSTAGRAM } from '../../events';
import { WHATSAPP_INVITE } from '../../links';

export { WHATSAPP_INVITE };

export interface Social {
  code: string;
  handle: string;
  href: string;
  label: string;
}

export interface SiteLink {
  index: string;
  label: string;
  href: string;
}

export const CONTACT = {
  email: 'hackclub.nust@seecs.edu.pk',
  location: 'NUST H-12, Islamabad',
  hq: 'https://hackclub.com',
} as const;

export const SOCIALS: readonly Social[] = [
  {
    code: 'FB',
    handle: 'hackclub.nust',
    href: 'https://facebook.com/hackclub.nust',
    label: 'Hack Club NUST on Facebook (opens in a new tab)',
  },
  {
    code: 'IG',
    handle: 'hackclub.nust',
    href: INSTAGRAM,
    label: 'Hack Club NUST on Instagram (opens in a new tab)',
  },
  {
    code: 'IN',
    handle: 'hackclub-nust',
    href: 'https://linkedin.com/company/hackclub-nust',
    label: 'Hack Club NUST on LinkedIn (opens in a new tab)',
  },
];

export const SITE_INDEX: readonly SiteLink[] = [
  { index: '01', label: 'Club', href: '#club' },
  { index: '02', label: 'Events', href: '#events' },
  { index: '03', label: 'Record', href: '#record' },
  { index: '04', label: 'Team', href: '#team' },
  { index: '05', label: 'Games', href: '#games' },
  { index: '06', label: 'Social', href: '#social' },
];
