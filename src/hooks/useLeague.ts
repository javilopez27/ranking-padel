import { useEffect, useState } from 'react';
import { fetchPublishedLeague, readDraft, saveDraft } from '../services/leagueRepository';
import { parseLeagueData, type LeagueData } from '../services/leagueSchema';

export function useLeague() {
  const [published, setPublished] = useState<LeagueData | null>(null);
  const [draft, setDraft] = useState<LeagueData | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true;
    fetchPublishedLeague().then(data => { if (active) setPublished(data); })
      .catch(() => { if (active) setError('No se ha podido cargar la liga publicada. Comprueba tu conexión o el archivo league.json.'); });
    return () => { active = false; };
  }, []);
  const persist = (data: LeagueData) => {
    setDraft(data);
    try { saveDraft(data); setNotice('Borrador guardado en este dispositivo. Aún no está publicado.'); }
    catch { setNotice('No se pudo guardar en este navegador. Descarga una copia antes de cerrar la página.'); }
  };
  const startEditing = () => {
    if (!published) return;
    try {
      const saved = readDraft();
      setDraft(saved ?? published);
      setNotice(saved && saved.updatedAt !== published.updatedAt
        ? 'Borrador recuperado. Puede diferir de la versión publicada; revisa los datos antes de publicar.'
        : 'Los cambios solo se guardan en este dispositivo hasta que publiques el archivo.');
    } catch { setDraft(published); setNotice('No se pudo recuperar el borrador. Se ha abierto la versión publicada.'); }
    setEditing(true);
  };
  const update = (change: (data: LeagueData) => LeagueData) => {
    if (!editing || !draft) { setNotice('Pulsa Gestionar liga para editar un borrador.'); return; }
    try { persist(parseLeagueData({ ...change(draft), updatedAt: new Date().toISOString() })); }
    catch { setNotice('No se ha guardado: revisa los nombres, resultados y parejas de la liga.'); }
  };
  const importData = async (file: File) => {
    try {
      if (file.size > 1_000_000) throw new Error();
      const data = parseLeagueData(JSON.parse(await file.text()));
      if (window.confirm('¿Reemplazar tu borrador con los datos de este archivo? La liga publicada no cambiará.')) persist(data);
    } catch { setNotice('Archivo no válido. Debe ser una copia league.json con 12 jugadores y un calendario y resultados correctos.'); }
  };
  return { data: editing ? draft : published, published, editing, error, notice, setNotice, startEditing,
    stopEditing: () => { setEditing(false); setNotice(''); }, update, importData,
    resetDraft: () => {
      if (published && window.confirm('¿Descartar el borrador y volver a la versión publicada?')) persist(published);
    },
  };
}
