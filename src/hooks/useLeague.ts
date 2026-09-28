import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPublishedLeague } from '../services/leagueRepository';
import type { LeagueData } from '../services/leagueSchema';

export function useLeague() {
  const [data, setData] = useState<LeagueData | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const inFlight = useRef(false);
  const lastCheck = useRef(0);

  const refresh = useCallback(async (force = false) => {
    if (inFlight.current || (!force && Date.now() - lastCheck.current < 3000)) return;
    inFlight.current = true;
    lastCheck.current = Date.now();
    setRefreshing(true);
    try {
      const next = await fetchPublishedLeague();
      setData(previous => previous && JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
      setError('');
    } catch {
      setError('No se han podido comprobar los resultados. Vuelve a intentarlo en unos minutos.');
    } finally {
      inFlight.current = false;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  return { data, error, refreshing, refresh };
}
