# bookish-lamp

Fullscreen sales dashboard for [mlclogistica.app](https://mlclogistica.app).

## Pages

**Vendas** — the main dashboard, split into two halves:

- **Realizadas** — 12-month stacked bar chart of won deals, grouped by pipeline, using close date. Each bar is proportional to the highest month. Pipeline legend shown above.
- **Em andamento** — open deals aggregated by one of 9 modes: Estágios, Responsáveis, Clientes, Contatos, Produtos, Campanhas, Origens, Times, Segmentos dos Clientes. Rows sorted by amount descending (stages keep pipeline display order). `< Em andamento >` arrows cycle through modes manually; automation cycles automatically.

**Configurações** — display settings:

- **Variação** — selects a color palette (1–256) from the pipeline color generator.
- **Luminosidade** — adjusts the lightness level used for both panel shading and pipeline colors.
- **Automação** — sets the auto-cycle interval in seconds (0 = disabled). Also controls the live data refetch interval: every `max(60, automation)` seconds.

All settings are persisted to `localStorage`.

## Data

In development, mock deals from `src/mocks.ts` are used. In production, data is fetched from:

```
GET https://api.dashboard.mlclogistica.app/deals
```

The app refetches live data every `max(60, automation)` seconds and re-renders automatically.

## Development

```bash
npm install
npm run dev      # starts Vite dev server (all interfaces)
npm test         # runs Vitest
npm run build    # production build to dist/
```

Linting uses [Biome](https://biomejs.dev):

```bash
biome lint src/
biome format src/ --write
```

## Stack

- React 19 + TypeScript, bundled with Vite
- `react-router-dom` for client-side routing
- `miniature-waffle` for pipeline color palette generation
- `psychic-potato` for automatic font sizing across all label elements
- `biome` for linting and formatting
- `vitest` + `jsdom` for unit tests

## Deployment

The `dist/` folder is a standard SPA build. The included `nginx.conf` serves it with a fallback to `index.html` for all routes.
