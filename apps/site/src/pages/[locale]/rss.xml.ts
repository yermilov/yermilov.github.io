import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { LOCALES, t, type Locale } from '@lib/i18n';
import { getPostsByLocale } from '@lib/content';

export async function getStaticPaths() {
  return LOCALES.map((locale) => ({ params: { locale } }));
}

export const GET: APIRoute = async ({ params, site }) => {
  const locale = params.locale as Locale;
  const strings = t(locale);
  const posts = await getPostsByLocale(locale);
  return rss({
    title: `${strings.site.title} (${locale.toUpperCase()})`,
    description: strings.site.tagline,
    site: site ?? 'https://yermilov.github.io',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.summary,
      link: `/${locale}/blog/${post.data.slug}/`,
      categories: post.data.tags,
    })),
    customData: `<language>${locale === 'uk' ? 'uk-UA' : 'en-US'}</language>`,
    trailingSlash: true,
  });
};
