import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '@lib/i18n';

type PostEntry = CollectionEntry<'posts'>;
type TalkEntry = CollectionEntry<'talks'>;
type LabEntry = CollectionEntry<'labs'>;
type GameEntry = CollectionEntry<'games'>;
type BookEntry = CollectionEntry<'books'>;

const isProd = import.meta.env.PROD;
function isPublished<T extends { data: { draft?: boolean } }>(entry: T): boolean {
  return !(isProd && entry.data.draft);
}

/**
 * URL slug for a post. Posts live under content/posts/{en,ua}/<slug>.mdx,
 * so Astro auto-derives entry.slug as e.g. "en/2023-wrapped". The locale
 * directory is a categorization device — strip it for URLs.
 */
export function postSlug(entry: PostEntry): string {
  return entry.slug.split('/').pop() ?? entry.slug;
}

/**
 * All published posts across both locales, newest first. Locale-agnostic on
 * purpose: the same blog list is shown under /en/blog/ and /ua/blog/ so a
 * Ukrainian visitor doesn't land on an empty page just because nothing has
 * been translated yet. Per-post pages still respect the locale and surface
 * a "Translation pending" banner when a post is shown in the other shell.
 */
export async function getPosts(): Promise<PostEntry[]> {
  const all = await getCollection('posts', isPublished);
  return all.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export async function getPostByCanonicalSlug(canonicalSlug: string, locale: Locale): Promise<PostEntry | undefined> {
  const all = await getCollection('posts', isPublished);
  return all.find((p) => p.data.canonicalSlug === canonicalSlug && p.data.language === locale);
}

export async function getAllCanonicalSlugs(): Promise<string[]> {
  const all = await getCollection('posts', isPublished);
  return [...new Set(all.map((p) => p.data.canonicalSlug))];
}

export async function getTalks(): Promise<TalkEntry[]> {
  const all = await getCollection('talks');
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getLabsByLocale(locale: Locale): Promise<LabEntry[]> {
  const all = await getCollection('labs');
  return all
    .filter((l) => l.data.language === locale)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export async function getGamesByLocale(locale: Locale): Promise<GameEntry[]> {
  const all = await getCollection('games');
  return all
    .filter((g) => g.data.language === locale)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export async function getLabBySlug(slug: string, locale: Locale): Promise<LabEntry | undefined> {
  const all = await getCollection('labs');
  return all.find((l) => l.data.slug === slug && l.data.language === locale);
}

export async function getGameBySlug(slug: string, locale: Locale): Promise<GameEntry | undefined> {
  const all = await getCollection('games');
  return all.find((g) => g.data.slug === slug && g.data.language === locale);
}

/**
 * All published books, newest first by readAt. Locale-agnostic — books
 * appear in the index under both /en/books/ and /ua/books/. The detail
 * page shows the entry in its own language regardless of which locale
 * shell wraps it.
 */
export async function getBooks(): Promise<BookEntry[]> {
  const all = await getCollection('books', isPublished);
  return all.sort((a, b) => b.data.readAt.getTime() - a.data.readAt.getTime());
}

export async function getBookBySlug(slug: string): Promise<BookEntry | undefined> {
  const all = await getCollection('books', isPublished);
  return all.find((b) => b.slug === slug);
}
