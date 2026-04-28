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
scripts/           build-games.ts
.github/workflows/ deploy.yml — GitHub Pages via Actions
```

See `CLAUDE.md` for the full developer guide and the 3-tier interactivity rule.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which:

1. builds any `apps/game-*` and copies their `dist/` into `public/games/<slug>/`,
2. builds the Astro site,
3. generates the Pagefind index,
4. publishes to GitHub Pages.

GitHub Pages settings: Source = "GitHub Actions" (not "Deploy from branch").

## Old blog archive

The 2017 Grain/Octopress archive lives in the separate
[`yermilov/old-blog`](https://github.com/yermilov/old-blog) repo, which has its
own GitHub Pages deploy mounted at `/old-blog/` (a same-owner project Pages site
auto-mounts at that path on the user-site domain). The About page in this site
links to it. Nothing in this repo touches the archive.
