const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function fetchDevelopers() {
  const res = await fetch(`${API_BASE}/developers`);
  if (!res.ok) throw new Error('Failed to fetch developers');
  const data = await res.json();
  return data.developers;
}

export async function fetchInsights(developerId, month) {
  const res = await fetch(`${API_BASE}/developers/${developerId}/insights?month=${month}`);
  if (!res.ok) throw new Error('Failed to fetch insights');
  return res.json();
}

export async function fetchTeamSummary(month) {
  const res = await fetch(`${API_BASE}/team/summary?month=${month}`);
  if (!res.ok) throw new Error('Failed to fetch team summary');
  return res.json();
}

export async function fetchMonths() {
  const res = await fetch(`${API_BASE}/months`);
  if (!res.ok) throw new Error('Failed to fetch months');
  const data = await res.json();
  return data.months;
}
