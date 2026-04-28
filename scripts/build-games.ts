#!/usr/bin/env tsx
/*
 * Build every Tier-3 game under apps/game-* with its own Vite build,
 * then copy each dist/ to apps/site/public/games/<slug>/ so the iframe
 * wrapper at /[locale]/games/<slug> can serve the bundle.
 *
 * No-op when no apps/game-* directories exist yet.
 *
 * Run before the Astro build:
 *   pnpm tsx scripts/build-games.ts && pnpm --filter site build
 */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync, mkdirSync, cpSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const appsDir = join(repoRoot, 'apps');
const sitePublicGames = join(repoRoot, 'apps', 'site', 'public', 'games');

const GAME_PREFIX = 'game-';

function listGameApps(): string[] {
  if (!existsSync(appsDir)) return [];
  return readdirSync(appsDir).filter((name) => {
    if (!name.startsWith(GAME_PREFIX)) return false;
    const full = join(appsDir, name);
    return statSync(full).isDirectory() && existsSync(join(full, 'package.json'));
  });
}

function buildGame(name: string): void {
  const slug = name.slice(GAME_PREFIX.length);
  const cwd = join(appsDir, name);
  const distDir = join(cwd, 'dist');
  const target = join(sitePublicGames, slug);

  console.log(`\n[games] building ${name} → public/games/${slug}/`);
  execSync('pnpm install --filter . --offline --prefer-offline', {
    cwd,
    stdio: 'inherit',
    env: { ...process.env },
  });
  execSync('pnpm build', { cwd, stdio: 'inherit', env: { ...process.env } });

  if (!existsSync(distDir)) {
    throw new Error(`[games] ${name} did not produce a dist/ directory`);
  }
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  cpSync(distDir, target, { recursive: true });
  console.log(`[games] copied ${name}/dist → public/games/${slug}/`);
}

function main(): void {
  const games = listGameApps();
  mkdirSync(sitePublicGames, { recursive: true });

  if (games.length === 0) {
    console.log('[games] no apps/game-* directories — nothing to build.');
    return;
  }

  console.log(`[games] found ${games.length} game(s): ${games.join(', ')}`);
  for (const game of games) buildGame(game);
  console.log(`\n[games] done.`);
}

main();
