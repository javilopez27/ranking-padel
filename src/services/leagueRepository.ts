import { parseLeagueData, type LeagueData } from './leagueSchema';

export const DRAFT_KEY = 'liga_padel_12_v2_draft';
export async function fetchPublishedLeague(): Promise<LeagueData> {
  const response = await fetch(`${import.meta.env.BASE_URL}league.json`, { cache: 'no-store' });
  if (!response.ok) throw new Error('No se han podido cargar los datos publicados. Comprueba la conexión y vuelve a intentarlo.');
  return parseLeagueData(await response.json());
}
export function readDraft(): LeagueData | null {
  const saved = localStorage.getItem(DRAFT_KEY);
  return saved ? parseLeagueData(JSON.parse(saved)) : null;
}
export function saveDraft(data: LeagueData): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(parseLeagueData(data)));
}
export function downloadLeague(data: LeagueData): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(parseLeagueData(data), null, 2) + '\n'], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = 'league.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
