# yermilov.github.io

Personal site of Yaroslav Yermilov — blog (EN + UK), lab, games, talks.

Stack: Astro 5/6 · TypeScript strict · MDX · React 19 islands · Tailwind v4 ·
Pagefind · pnpm workspaces · GitHub Pages.

## Quick start

```sh
nvm use                                # Node 24
corepack enable                        # if pnpm isn't installed
pnpm install
pnpm dev                               # http://localhost:4321
```

## Layout

```
apps/site/         Astro site
apps/game-*/       (future) Tier-3 games, each with its own Vite build
packages/shared-*/ design tokens, eslint/tsconfig/prettier base
scripts/           build-games.ts, snapshot-old-blog.ts
.github/workflows/ deploy.yml — GitHub Pages via Actions
```

See `CLAUDE.md` for the full developer guide and the 3-tier interactivity rule.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which:

1. fetches `origin/legacy/master` so the old-blog snapshot script works,
2. snapshots the legacy site into `public/old-blog/` with a return-banner injected,
3. builds any `apps/game-*` and copies their `dist/` into `public/games/<slug>/`,
4. builds the Astro site,
5. generates the Pagefind index,
6. publishes to GitHub Pages.

GitHub Pages settings: Source = "GitHub Actions" (not "Deploy from branch").

## Old blog archive

The 2017 Grain/Octopress build is preserved on the `legacy/master` branch and
served from `/old-blog/`. The new site links to it from the About page.
Anything you want to read from the old blog should still resolve at its
original URL inside `/old-blog/`.
