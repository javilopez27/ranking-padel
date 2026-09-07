import { parseLeagueData, type LeagueData } from './leagueSchema';

export async function fetchPublishedLeague(): Promise<LeagueData> {
  const response = await fetch(`${import.meta.env.BASE_URL}league.json`, { cache: 'no-store' });
  if (!response.ok) throw new Error('No se han podido cargar los datos publicados.');
  return parseLeagueData(await response.json());
}
