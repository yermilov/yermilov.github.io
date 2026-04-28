#!/usr/bin/env tsx
/*
 * Snapshot the legacy Grain/Octopress blog (origin/legacy/master) into
 * apps/site/public/old-blog/ and inject a small "back to /" banner into
 * each .html file so visitors landing on an archived URL know they're
 * inside the archive.
 *
 * Idempotent — wipes the target directory before extracting.
 */
import { execSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const target = join(repoRoot, 'apps', 'site', 'public', 'old-blog');

const LEGACY_REF = process.env['OLD_BLOG_REF'] ?? 'origin/legacy/master';

// GitHub Pages silently refuses to deploy subtrees whose path components
// contain characters like `:`. The legacy Grain build accidentally produced
// a directory `https:/yermilov.github.io/`, which broke the first /old-blog/
// deploy (Pages kept serving the previous build's files). Strip such paths
// from the extracted archive before the build copies it into dist/.
const FORBIDDEN_NAME = /[:?*<>|]/;

const BANNER = `
<style>
  #yk-archive-banner{
    position:fixed;top:0;left:0;right:0;z-index:99999;
    background:#1f5d3b;color:#f7f3ea;
    font:13px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
    padding:8px 14px;display:flex;gap:14px;align-items:center;
    box-shadow:0 1px 0 rgba(0,0,0,0.15);
  }
  #yk-archive-banner a{color:#f08a3c;text-decoration:underline}
  #yk-archive-banner button{
    margin-left:auto;background:transparent;border:1px solid #f7f3ea44;
    color:#f7f3ea;border-radius:3px;padding:2px 8px;cursor:pointer;font:inherit;
  }
  body{margin-top:42px !important}
</style>
<div id="yk-archive-banner">
  <span>Archive of the 2017 blog —
    <a href="/">return to yermilov.github.io</a>
  </span>
  <button type="button" onclick="this.parentElement.remove();document.body.style.marginTop='';">dismiss</button>
</div>
`;

function ensureLegacyRef(): void {
  try {
    execSync(`git rev-parse --verify ${LEGACY_REF}^{commit}`, {
      cwd: repoRoot,
      stdio: 'pipe',
    });
  } catch {
    throw new Error(
      `[old-blog] cannot resolve ${LEGACY_REF}. ` +
        `Run \`git fetch origin legacy/master:legacy/master\` or set OLD_BLOG_REF.`,
    );
  }
}

function extractArchive(): void {
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  execSync(`git archive --format=tar ${LEGACY_REF} | tar -x -C "${target}"`, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: '/bin/sh',
  });
}

function pruneForbidden(dir: string): number {
  let removed = 0;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (FORBIDDEN_NAME.test(name)) {
      rmSync(full, { recursive: true, force: true });
      removed += 1;
      continue;
    }
    if (statSync(full).isDirectory()) removed += pruneForbidden(full);
  }
  return removed;
}

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function injectBanner(): number {
  let touched = 0;
  for (const path of walk(target)) {
    if (!path.endsWith('.html')) continue;
    const html = readFileSync(path, 'utf8');
    if (html.includes('id="yk-archive-banner"')) continue;
    const replaced = html.includes('<body')
      ? html.replace(/(<body[^>]*>)/i, `$1\n${BANNER}`)
      : `${BANNER}\n${html}`;
    if (replaced !== html) {
      writeFileSync(path, replaced);
      touched += 1;
    }
  }
  return touched;
}

function main(): void {
  console.log(`[old-blog] snapshotting ${LEGACY_REF} → public/old-blog/`);
  ensureLegacyRef();
  extractArchive();
  if (!existsSync(target) || readdirSync(target).length === 0) {
    throw new Error('[old-blog] archive extracted but target directory is empty');
  }
  const pruned = pruneForbidden(target);
  if (pruned > 0) {
    console.log(`[old-blog] pruned ${pruned} forbidden path(s) (e.g. names with ':')`);
  }
  const touched = injectBanner();
  console.log(`[old-blog] done; injected banner into ${touched} HTML file(s).`);
}

main();
