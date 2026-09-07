# Ranking Padel

Aplicacion estatica para publicar el ranking de padel del grupo en GitHub Pages. La web es solo de consulta: nadie puede editar resultados desde el navegador.

## Como se actualiza

Solo puede cambiar la liga quien tenga permiso de escritura en el repositorio de GitHub.

1. Edita `public/league.json` en tu ordenador.
2. Valida los datos:

```sh
npm run validate:data
```

3. Sube el cambio:

```sh
git add public/league.json
git commit -m "Actualiza resultados"
git push
```

GitHub Actions compila y publica la web automaticamente en GitHub Pages.

## Escribir resultados en league.json

Partido pendiente:

```json
{
  "sets": [],
  "status": "pending"
}
```

Gana la pareja 1 por 6-4 y 6-3:

```json
{
  "sets": [
    { "games1": 6, "games2": 4 },
    { "games1": 6, "games2": 3 }
  ],
  "status": "completed",
  "winnerTeam": 1
}
```

Gana la pareja 2 en tres sets:

```json
{
  "sets": [
    { "games1": 6, "games2": 4 },
    { "games1": 3, "games2": 6 },
    { "games1": 4, "games2": 6 }
  ],
  "status": "completed",
  "winnerTeam": 2
}
```

Partido aplazado:

```json
{
  "sets": [],
  "status": "postponed",
  "postponedNote": "Pendiente de nueva fecha"
}
```

Mantén intactos `id`, `roundNumber`, `matchNumberInRound`, `team1` y `team2`, salvo que quieras cambiar el calendario completo.

## Publicacion inicial

```sh
git init
git add .
git commit -m "Primera version"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/ranking-padel.git
git push -u origin main
```

En GitHub activa **Settings -> Pages -> Build and deployment -> Source -> GitHub Actions**.

## Desarrollo local

```sh
npm ci
npm run dev
```

Abre `http://localhost:3000`.

Antes de subir cambios de codigo:

```sh
npm test
npm run build
```

## Estructura

- `public/league.json`: datos publicados del ranking.
- `public/fotos_ranking/`: avatares publicados.
- `src/components/`: interfaz de consulta.
- `src/services/leagueSchema.ts`: validacion del archivo de datos.
- `.github/workflows/deploy.yml`: despliegue automatico en GitHub Pages.
