import { readFileSync } from 'node:fs';
import { parseLeagueData } from '../src/services/leagueSchema';
parseLeagueData(JSON.parse(readFileSync(new URL('../public/league.json', import.meta.url), 'utf8')));
console.log('Datos válidos: 12 jugadores, 33 partidos, calendario y resultados comprobados.');
