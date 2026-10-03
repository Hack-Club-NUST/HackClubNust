/**
 * Client half of the applications inbox. Executive recruitment is closed for
 * this tenure, so nothing here submits an application any more — this is what
 * the staff page at /applications uses to read the ones already received.
 */

export type PortfolioId = 'tech' | 'media' | 'hr' | 'em';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`);
  return body as T;
}

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
