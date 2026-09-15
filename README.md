# Ranking Padel

Aplicacion estatica para publicar el ranking de padel del grupo en GitHub Pages. La web es solo de consulta: nadie puede editar resultados desde el navegador.

## Como se actualiza

Solo puede cambiar la liga quien tenga permiso de escritura en el repositorio de GitHub.

1. Edita `data/resultados.csv` desde GitHub, el movil o tu ordenador.
2. Sube el cambio:

```sh
git add data/resultados.csv
git commit -m "Actualiza resultados"
git push
```

GitHub Actions genera `public/league.json`, comprueba los datos y publica la web automaticamente en GitHub Pages.

Si quieres comprobarlo antes de subir:

```sh
npm run apply:results
npm run validate:data
```

## Escribir resultados en resultados.csv

Cada fila es un partido. Lo normal es tocar solo estas columnas:

- `status`: `pending`, `completed` o `postponed`.
- `winnerTeam`: `1` si gana la pareja izquierda, `2` si gana la derecha.
- `sets`: formato corto, por ejemplo `6-4 7-5`.
- `postponedNote`: solo si esta aplazado.

Partido pendiente:

```csv
m_1_2,pending,,,,,Pista 2
```

Gana la pareja 1 por 6-4 y 6-3:

```csv
m_1_2,completed,1,"6-4 6-3",,,Pista 2
```

Gana la pareja 2 en tres sets:

```csv
m_1_2,completed,2,"6-4 3-6 4-6",,,Pista 2
```

Partido aplazado:

```csv
m_1_2,postponed,,,,Pendiente de nueva fecha,Pista 2
```

No cambies los `id`: son el enlace entre tu tabla y el calendario final.

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

- `data/resultados.csv`: tabla comoda para actualizar resultados.
- `public/league.json`: datos publicados del ranking, generados desde el CSV.
- `public/fotos_ranking/`: avatares publicados.
- `src/components/`: interfaz de consulta.
- `src/services/leagueSchema.ts`: validacion del archivo de datos.
- `.github/workflows/deploy.yml`: despliegue automatico en GitHub Pages.
