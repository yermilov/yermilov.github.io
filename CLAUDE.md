# yermilov.github.io — agent guide

This file is loaded automatically into Claude Code's context. Read it before
making changes. The conventions here are deliberate; deviating from them
costs more than following them.

## What this repo is

A long-lived personal site (5+ year horizon) for Yaroslav Yermilov. Hosts
blog posts in EN + UK, embedded interactive demos, occasional canvas/WebGL
games, and a list of conference talks. Co-developed with Claude Code, so the
architecture intentionally favors the lowest-magic path.

## Stack

- **Astro** static site at `apps/site/` (TypeScript strict, MDX, React 19 islands)
- **Tailwind CSS v4** via `@tailwindcss/vite`; tokens live in CSS, not in a config file
- **pnpm workspaces** — `apps/site`, `apps/game-*` (one per game), `packages/shared-*`
- **Pagefind** static search built post-build
- **GitHub Pages** deploy via `.github/workflows/deploy.yml` (Railway is deferred until a backend is needed)
- Node 24 LTS, pnpm 9.x

## The 3-tier interactivity rule — load-bearing

```
Tier 1 — MDX island
  Calculators, tiny charts, inline visualizations, deterministic
  generative-art stills.
  React component imported into .mdx and rendered with
  <X client:visible /> (or client:load).
  Shares site Tailwind, typography, theme.
  No frame loop, no audio, no input capture, no fullscreen.

Tier 2 — Astro lab page
  Standalone medium visualizations (D3 dashboards, longer interactive
  demos).
  Lives at /{locale}/lab/<slug>, lazy-loaded React island, no iframe.
  Inherits theme-lab class so it can be louder than the reading surface.

Tier 3 — Iframe + separate Vite app
  Anything with a render loop, audio, input capture, fullscreen, or
  pointer lock — even if "tiny".
  Built as apps/game-<slug>/ with its own package.json and Vite build.
  Output served from /games/<slug>/index.html (sandboxed iframe).
  Astro wrapper at /{locale}/games/<slug> hosts an <iframe sandbox=…>.

Decision rule:
  has frame loop OR audio OR input handlers OR fullscreen OR pointer lock?
    yes → Tier 3, no exceptions.
  is it a standalone medium-sized visualization?
    yes → Tier 2.
  otherwise → Tier 1.
```

If unsure, default to Tier 3 — it's the least likely to cause site-wide
regressions.

## Path aliases

Always reference these instead of relative paths from outside `apps/site/src/`:

```
@components/*  apps/site/src/components/*
@layouts/*     apps/site/src/layouts/*
@content/*     apps/site/src/content/*
@lib/*         apps/site/src/lib/*
@styles/*      apps/site/src/styles/*
```

## URL convention — frozen

`/{locale}/{section}/{stable-slug}/` with trailing slash. Locales:
`en` (default), `uk`. Slugs are forever — never derive them from titles
or dates.

## Content schemas

Defined in `apps/site/src/content/config.ts`. Every post carries:

- `slug` (stable, forever)
- `canonicalSlug` (joins translations across languages)
- `language` (`en` | `uk`)
- `translations` (`{ en?: slug, uk?: slug }`) — explicit cross-language map

A post can exist in EN, UK, or both. Joining is by `canonicalSlug`, not by
file path. If only one language exists, the locale switcher disables the
other side and the missing-locale URL renders the original-language body
inside the requested-locale shell with a "Translation pending" banner.

## How to add a new blog post

```
apps/site/src/content/posts/{en|uk}/<stable-slug>.mdx
```

Frontmatter (minimal):

```yaml
---
title: "..."
slug: "stable-slug"
canonicalSlug: "stable-slug"   # same across translations
language: "en"                  # or "uk"
publishedAt: 2026-04-27
summary: "One sentence."
tags: []
translations:
  en: "stable-slug"
  uk: "stable-slug-uk"          # only if a UK version exists
---
```

A Tier-1 island goes inline:

```mdx
import MyChart from "@components/post/MyChart.tsx";

<MyChart client:visible />
```

## How to add a new lab entry (Tier 2)

```
apps/site/src/content/labs/<slug>.mdx
```

Frontmatter must include `islandComponent` pointing to a path under
`apps/site/src/components/lab/`. The body MDX renders inside the
inverted-theme `LabLayout`.

## How to add a new game (Tier 3)

1. `mkdir apps/game-<slug>` and scaffold a Vite TS app there.
2. Game's `vite.config.ts` must set `base: '/games/<slug>/'` so its
   bundled asset URLs work when iframed under that path.
3. Game's `pnpm build` writes `apps/game-<slug>/dist/`.
4. Add a content entry at `apps/site/src/content/games/<slug>.mdx`
   with a frontmatter `slug` matching the directory name.
5. Push. CI runs `scripts/build-games.ts` which copies each game's
   `dist/` into `apps/site/public/games/<slug>/`.

## Files NEVER edit by hand

- `apps/site/public/games/` — build artifact (from `apps/game-*`)
- `apps/site/public/old-blog/` — snapshot of `origin/legacy/master`
- `apps/site/public/pagefind/` — Pagefind index

All three are gitignored and rebuilt every CI run.

## Common commands

```
pnpm install                        # install all workspaces
pnpm dev                            # start Astro dev (apps/site only)
pnpm build                          # full prod build (snapshot + games + site + pagefind)
pnpm --filter site dev              # equivalent to `pnpm dev`
pnpm --filter site typecheck        # astro check
pnpm tsx scripts/snapshot-old-blog.ts   # populate /old-blog/ from legacy/master
pnpm tsx scripts/build-games.ts          # build apps/game-* into public/games/
```

## Gotchas

- **Tailwind v4**: configuration is CSS, not JS. Tokens are in
  `apps/site/src/styles/tokens.css` (extends `@yermilov/shared-tokens`).
  Do NOT create a `tailwind.config.ts`.
- **React islands** must opt in to hydration with `client:*` directives.
  Default is server-only render.
- **i18n routes**: `prefixDefaultLocale: true`, so root `/` is a 308 redirect
  to `/en/`. Never link to a path without a locale prefix.
- **Trailing slashes**: enforced via `trailingSlash: 'always'` in
  `astro.config.ts`. Pagefind and the GH Pages 404 handler depend on this.
- **Drafts**: `draft: true` posts are rendered in dev but skipped in prod.
  Don't rely on this for sensitive material.
- **Old blog branch**: lives at `origin/legacy/master`. CI fetches it; locally
  run `git fetch origin legacy/master:legacy/master` once before
  running `scripts/snapshot-old-blog.ts`.
