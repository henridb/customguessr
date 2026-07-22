# GalaxyGuessr

A GeoGuessr-style game played on a single galaxy image. Each game is 5 rounds;
you're shown the name of a planet or star and click where you think it is on the
map. Closer clicks score more (up to 5000 per round, 25000 total). Fully
client-side — no backend.

> The repository and npm package are named `customguessr`; the game is branded
> **GalaxyGuessr**. The GitHub Pages base path is `/customguessr/`, matching the
> repo name.

## Tech stack

React + TypeScript, built with Vite (run via Bun), styled with Tailwind CSS,
dependencies managed with pnpm. Deployed to GitHub Pages via GitHub Actions.

## Development

```sh
pnpm install     # install dependencies
bun run dev      # start the dev server (Vite)
bun run build    # type-check and build to dist/
bun run preview  # preview the production build
```

## Pages

- **`/`** — the player page: New Game, then 5 rounds and a scoreboard.
- **`/#/admin`** — the editor for the planet/star dataset (see below).

## Editing the dataset

The dataset lives in `src/data/planets.json` (bundled at build time). It is
edited through the admin page rather than by hand:

1. Go to `/#/admin` and log in (default password: `galaxy-admin`).
2. Click empty space on the map to add a body, or click a marker to edit/delete.
3. Click **Export planets.json** to download the updated file.
4. Commit the downloaded file over `src/data/planets.json` and push.

There is no live database — publishing changes means committing the exported
file. To change the admin password, replace `PASSWORD_HASH` in
`src/admin/auth.ts` with the SHA-256 hash of your password:

```sh
bun -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
```

## Swapping the map image

Drop your galaxy image into `src/assets/`, then update the import and
`MAP_ASPECT_RATIO` (width / height) in `src/data/mapConfig.ts`. Coordinates are
stored normalized to the image, so existing bodies keep their relative positions.

## Deployment

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds and
publishes to GitHub Pages. One-time setup: in the repo, go to
**Settings → Pages → Build and deployment → Source** and select
**GitHub Actions**.
