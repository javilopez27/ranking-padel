import { useEffect, useState } from 'react';
import { fetchPublishedLeague } from '../services/leagueRepository';
import type { LeagueData } from '../services/leagueSchema';

export function useLeague() {
  const [data, setData] = useState<LeagueData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchPublishedLeague()
      .then((league) => {
        if (active) setData(league);
      })
      .catch(() => {
        if (active) setError('No se ha podido cargar el ranking. Inténtalo de nuevo en unos minutos.');
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, error, setData };
}
