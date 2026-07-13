# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server (default `http://localhost:5173`).
- `npm run build` — typecheck (`tsc -b`) then production build to `dist/`.
- `npm run lint` — ESLint over the whole project.
- `npm run preview` — serve the built `dist/` locally (uses the long-cache headers set in `vite.config.ts`).
- No test suite/framework is configured in this repo.
- Admin mode (in-app CMS): append `?admin=true` to any URL, e.g. `http://localhost:5173/?admin=true`.
- Android: after a build, `npx cap sync android`, then `cd android && .\gradlew assembleDebug` (see `Comandos.txt` for the full local workflow, including converting a `.glb` with `gltfjsx`).

## Architecture

This is a 360° virtual tour (React Three Fiber / Three.js) for the Zibatá real-estate development. There is no backend of its own — the browser talks directly to Supabase (Postgres + Storage) using the anon/publishable key in `.env`, and every admin mutation (create/edit/delete node, hotspot, label, upload photo) happens client-side.

### Data model & central store
- `src/store/useTourStore.ts` is the single Zustand store for the entire app: navigation state, the loaded tour graph, and every admin CRUD action. `cargarNodos()` fetches the `nodos` table joined with `hotspots` and `labels`, and reshapes each row into the in-memory `nodos` map keyed by node id (see `src/types.ts` for the shape: `INodo`, `IHotspot`, `ILabel`).
- Scene navigation goes through `cargarNodo(id)` (fade transition + syncs `?nodo=` in the URL); the initial node is read from that same query param on load.
- `CATEGORIA_VISTA_AEREA` (`'Exteriores Zibatá'`) is a special category: the store tracks `ultimoNodoAereo` (the last aerial-category node visited) so the "Volver a Vista Aérea" button in `OverlayUI.tsx` returns to the correct aerial scene rather than a hardcoded one.
- Several store actions accept an optional node id (`crearNuevoHotspot`, `crearNuevoLabel`) or search across *all* nodes rather than assuming the currently active one (`actualizarPropiedadesHotspot`, `actualizarPropiedadesLabel`) — this is what lets the admin "Explorador" panel edit any node's hotspots/labels without first navigating into that scene.
- Supabase has no `ON DELETE CASCADE` on this schema: deleting a node (`borrarNodo`) manually deletes its hotspots (both as origin and as another node's destination), its labels, and its Storage files before deleting the row.

### Admin mode
Gated behind `?admin=true` (checked once in `App.tsx`). Renders `AdminSidebar` (the icon dock) plus one of:
- `AdminExplorador` — searchable list of every node, expandable to inline-edit its hotspots/labels, with bulk "generate missing blur/thumbnail" actions.
- `AdminMode` — create a new node (uploads the 360 photo, auto-generates its blur + thumbnail).
- `PanelEditarNodo` — edit the *active* node: title, map position, GPS, replace its 360 photo, or delete it.
- `PanelEditorHotspots` / `PanelEditorLabels` — edit whichever hotspot/label was just clicked in the live 3D scene (drag-to-reposition only works this way, in-scene).

### Image pipeline
`src/utils/imagenAWebp.ts` converts any uploaded image to WebP client-side (`createImageBitmap` + canvas) before it ever reaches Supabase Storage: `convertirAWebP` (full 360 photo, no resize, quality ~0.82) and `generarVersionBlur` (tiny ~64px-wide placeholder). `EsferaProgresiva.tsx` shows the low-res blur texture immediately and swaps to the full-res texture once it finishes loading.

### 3D scene & intro
`App.tsx` owns the single `<Canvas>` and a scripted intro sequence (logo splash → "tiny planet" aerial fall-in, several seconds of fixed `setTimeout`s) before `mostrarElementos3D` flips on and hotspots/labels render. `Escena360.tsx` renders the current node's sphere plus its hotspots/labels, swapping to the draggable `HotspotEditable`/`LabelEditable` variants when the matching admin editor panel is open.

### Other integrations
- Google Maps JS API is lazy-loaded on first open of the "Ubicación" panel (`src/utils/mapaRadar.ts`) rather than in `index.html`, so it isn't fetched on every page view.
- The minimap and the full "Mapa" panel (`MapaBase.tsx`) render a flat plan image (`public/Assets/zibata_plano.webp`) manipulated with CSS transforms — it is not a real map/geo layer.
- Capacitor wraps the built `dist/` as an Android app (`capacitor.config.ts`, `android/`).
- The app is also meant to run embedded in an iframe (a separate sales-kiosk app): `main.tsx` detects `window.self !== window.top` and adds a `body.en-iframe` class, which `index.css` uses to push top-anchored UI down so it clears the host app's floating bar.
- `vite.config.ts` renames the JS/CSS output dir to `app-scripts` (to avoid colliding with `public/Assets`) and defines manual vendor chunks for `three`/`@react-three`, `@supabase`, and `react`; `vercel.json` sets long-lived cache headers matching that same `app-scripts` path.
