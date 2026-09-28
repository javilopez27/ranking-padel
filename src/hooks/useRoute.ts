import { useEffect, useState } from 'react';
import { parseRoute, routeHash, type Route } from '../utils/navigation';

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));

  useEffect(() => {
    const sync = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  function navigate(next: Route) {
    const hash = routeHash(next);
    if (window.location.hash !== hash) window.location.hash = hash;
    else setRoute(next);
  }

  function replace(next: Route) {
    window.history.replaceState(null, '', routeHash(next));
    setRoute(next);
  }

  return { route, navigate, replace };
}
