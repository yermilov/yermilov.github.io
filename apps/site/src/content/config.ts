import { defineCollection, z } from 'astro:content';

const localeEnum = z.enum(['en', 'ua']);

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    language: localeEnum,
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    translations: z
      .object({
        en: z.string().optional(),
        ua: z.string().optional(),
      })
      .default({}),
    canonicalSlug: z.string(),
    featured: z.boolean().default(false),
    interactive: z.enum(['none', 'tier1', 'tier2', 'tier3']).default('none'),
    coverImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const talks = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    event: z.string(),
    date: z.coerce.date(),
    language: localeEnum.optional(),
    abstract: z.string(),
    videoUrl: z.string().url().optional(),
    slidesUrl: z.string().url().optional(),
    repoUrl: z.string().url().optional(),
    eventUrl: z.string().url().optional(),
    /** paths under apps/site/public/, e.g. "/talks/<slug>/01.jpg" */
    photos: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

const labs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    publishedAt: z.coerce.date(),
    language: localeEnum,
    summary: z.string(),
    /** path under src/components/lab/, e.g. "ColorClock" */
    islandComponent: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

const games = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    /** must match apps/game-<slug> and public/games/<slug>/ */
    slug: z.string(),
    publishedAt: z.coerce.date(),
    language: localeEnum,
    summary: z.string(),
    controls: z.string(),
    width: z.number().default(960),
    height: z.number().default(640),
    tags: z.array(z.string()).default([]),
  }),
});

const gallery = defineCollection({
  type: 'data',
  schema: z.object({
    date: z.coerce.date(),
    caption: z.string().optional(),
    location: z.string().optional(),
    /** path under apps/site/public/, e.g. "/gallery/2018-08-15.jpg" */
    src: z.string(),
  }),
});

export const collections = { posts, talks, labs, games, gallery };
