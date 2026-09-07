# Liga Pádel 12

Aplicación para gestionar una liga de 12 amigos, manteniendo el diseño de Google AI Studio: fondo oscuro, verde lima, naranja y tipografía deportiva. React + TypeScript + Vite, lista para GitHub Pages.

## Publicarla en GitHub Pages

1. Crea un repositorio en GitHub (público para usar Pages con GitHub Free).
2. Sube **todo el contenido de esta carpeta**, incluyendo `.github/workflows/deploy.yml` y `package-lock.json`. No subas `node_modules`, `dist` ni `artifacts`. Usa la rama `main` (también se admite `master`).
3. En el repositorio abre **Settings → Pages → Build and deployment → Source → GitHub Actions**. Solo hay que configurarlo una vez.
4. Abre **Actions → Publicar liga en GitHub Pages → Run workflow** si el primer despliegue no se ha ejecutado tras activar Pages.
5. Cuando termine, encontrarás la dirección en **Settings → Pages**, normalmente `https://TU-USUARIO.github.io/TU-REPOSITORIO/`.

Cada nuevo cambio enviado a la rama principal ejecuta las pruebas, valida los datos, compila y publica automáticamente. Los pull requests se comprueban sin publicar. No necesitas claves API, Gemini, un servidor ni una base de datos.

La configuración usa rutas relativas y funciona tanto en un subdirectorio de repositorio como en un dominio propio. Para usar otra rama principal, cambia `on.push.branches` en el workflow.

Documentación oficial: [GitHub Pages con Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) y [despliegue de Vite](https://vite.dev/guide/static-deploy.html).

## Subir cambios con Git

Primera subida desde esta carpeta:

```sh
git init
git add .
git commit -m "Primera version de la liga"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

Despues de eso, cada cambio se sube asi:

```sh
git status
git add .
git commit -m "Actualiza liga"
git push
```

Si solo cambias resultados desde la web, pulsa **Descargar datos**, reemplaza `public/league.json` con ese archivo y haz el commit. Si cambias codigo o textos, ejecuta antes `npm test` y `npm run build`.

## Cómo gestionar la liga

La web abre siempre la **liga publicada**, que es la misma para los 12 jugadores. Se obtiene de `public/league.json`. Recarga la página para consultar una nueva publicación.

1. El organizador pulsa **Gestionar liga**. Se abre un borrador local; si ya existe, se recupera.
2. En **Jugadores** cambia nombres, apodos y lado de pista. En **Jornadas** registra resultados, pistas, fechas o aplazamientos. La clasificación se recalcula automáticamente.
3. Pulsa **Descargar datos**. Se descarga `league.json`, que también sirve como copia de seguridad.
4. En GitHub entra en la carpeta **public**, pulsa **Add file → Upload files**, sube el archivo descargado reemplazando `league.json` y confirma con **Commit changes**.
5. Espera a que termine Actions. Recarga la web: todos verán los cambios.

**Descargar no publica.** El borrador vive solo en ese navegador. Si se borra su almacenamiento, puede perderse; descarga copias regularmente. **Importar copia** valida y restaura un archivo en el borrador. **Descartar borrador** vuelve a los datos publicados. **Ver publicada** permite salir de la edición sin perder el borrador guardado.

GitHub Pages sirve archivos estáticos y no recibe escrituras de los móviles. El acceso al repositorio de GitHub controla quién publica; el botón Gestionar liga no es un inicio de sesión. Cualquier visitante puede preparar su propia copia local, pero no modificar la liga del grupo. Si necesitáis que cada jugador publique desde su móvil sin pasar por GitHub, habrá que añadir un servicio compartido con autenticación.

## Datos iniciales y reglas

- Los jugadores ya están cargados con los nombres indicados. Falta confirmar el jugador 12, que queda como `Jugador 12`.
- Los 33 partidos empiezan pendientes, sin votos ni campeones ficticios.
- Calendario Whist: 11 jornadas, cada compañero una vez, cada rival dos veces.
- Victoria: 3 puntos. Desempates: diferencia de sets, diferencia de juegos, sets a favor, juegos a favor y nombre como último criterio estable.
- Partidos al mejor de 3 sets: 6–0 a 6–4, 7–5 o 7–6. No se admite supertiebreak a 10 en esta versión.
- Premios previstos por pareja: 80 € y 40 €.
- La fase final usa el draft de capitanes del diseño original. Tras completar la liga, los cuatro primeros eligen compañeros entre los puestos 5º y 8º. Se guardan parejas y resultados de semifinales y final.
- Cambiar una semifinal borra el resultado de la final, previa confirmación. Cambiar la liga regular con un cuadro fijado reinicia la fase final para no mantener clasificados incorrectos.
- Las fechas de las jornadas (septiembre–noviembre de 2026) se configuran en `src/data/initialData.ts`. Los nombres y resultados se gestionan desde la web.
- WhatsApp prepara el mensaje; tú decides enviarlo. No sincroniza los datos de la web.

## Ejecutarla en tu ordenador

Instala Node.js 22 y ejecuta en esta carpeta:

```sh
npm ci
npm run dev
```

Abre `http://localhost:3000`. Para verificar y generar la versión publicable:

```sh
npm test
npm run build
npm run preview
```

El resultado está en `dist/`. GitHub Actions genera esta carpeta automáticamente; no necesitas subirla al repositorio. `npm run build` comprueba TypeScript y los datos antes de compilar.

## Estructura

- `src/components/`: interfaz y formularios.
- `src/hooks/useLeague.ts`: estado, edición y mensajes de guardado.
- `src/services/leagueRepository.ts`: lectura de datos publicados, almacenamiento local y exportación.
- `src/services/leagueSchema.ts`: validación de datos importados y publicados.
- `src/utils/`: clasificación, calendario, resultados y textos de WhatsApp.
- `public/league.json`: única fuente de datos publicada.
- `tests/`: pruebas de calendario, resultados, clasificación e importaciones.
- `.github/workflows/deploy.yml`: comprobación y publicación automática.

Los datos locales de la maqueta anterior (`liga_padel_12_v1_*`) no se eliminan, pero no se mezclan automáticamente con la liga publicada.
