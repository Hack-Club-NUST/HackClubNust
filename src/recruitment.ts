/**
 * Client half of executive recruitment. The portfolio list, the school list and
 * the open/closed flag all come from `GET /api/recruitment` rather than being
 * duplicated here — the server owns them, so closing applications or adding a
 * portfolio is a server change alone.
 */

export type PortfolioId = 'tech' | 'media' | 'hr' | 'em';

export interface Portfolio {
  id: PortfolioId;
  name: string;
  blurb: string;
}

export interface RecruitmentConfig {
  open: boolean;
  portfolios: Portfolio[];
  schools: string[];
  years: string[];
}

export interface ApplicationDraft {
  name: string;
  email: string;
  phone: string;
  school: string;
  year: string;
  portfolio: PortfolioId | '';
  link: string;
  why: string;
  experience: string;
}

export interface ApplicationResult {
  ok: true;
  portfolio: PortfolioId;
  /** True when this email had already applied to this portfolio — an edit, not a new row. */
  resubmitted: boolean;
}

/** What each portfolio actually does day to day, for the cards. */
export const PORTFOLIO_DETAIL: Record<PortfolioId, { icon: string; work: string[] }> = {
  tech: {
    icon: 'bi-code-slash',
    work: ['Run workshops', 'Build club projects', 'Maintain the site & games', 'Mentor at hackathons'],
  },
  media: {
    icon: 'bi-camera-reels',
    work: ['Design and branding', 'Photo and video', 'Social content', 'Event coverage'],
  },
  hr: {
    icon: 'bi-people',
    work: ['Member onboarding', 'Team culture', 'Inductions and interviews', 'Internal comms'],
  },
  em: {
    icon: 'bi-calendar-event',
    work: ['Plan hackathons', 'Venue and logistics', 'Sponsorships', 'Run the day'],
  },
};

export const WHY_MIN = 40;
export const WHY_MAX = 800;
export const EXPERIENCE_MAX = 800;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`);
  return body as T;
}

export function fetchRecruitment() {
  return request<RecruitmentConfig>('/recruitment');
}

export function submitApplication(draft: ApplicationDraft) {
  return request<ApplicationResult>('/applications', {
    method: 'POST',
    body: JSON.stringify(draft),
  });
}

/* ------------------------------ staff side ------------------------------ */

export type ApplicationStatus = 'new' | 'shortlisted' | 'accepted' | 'rejected';

export interface ApplicationRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  school: string;
  year: string;
  portfolio: PortfolioId;
  link: string;
  why: string;
  experience: string;
  status: ApplicationStatus;
  createdAt: number;
  updatedAt: number;
}

export interface ApplicationInbox {
  entries: ApplicationRow[];
  counts: { total: number; byPortfolio: Partial<Record<PortfolioId, number>> };
}

export function fetchApplications(staffKey: string, portfolio?: PortfolioId | '') {
  const query = portfolio ? `?portfolio=${portfolio}` : '';
  return request<ApplicationInbox>(`/applications${query}`, {
    headers: { 'Content-Type': 'application/json', 'x-staff-key': staffKey },
  });
}

export function setApplicationStatus(
  staffKey: string,
  id: string,
  status: ApplicationStatus
) {
  return request<{ id: string; status: ApplicationStatus }>(`/applications/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-staff-key': staffKey },
    body: JSON.stringify({ status }),
  });
}
