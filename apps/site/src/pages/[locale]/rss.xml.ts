import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { LOCALES, t, bcp47Locale, type Locale } from '@lib/i18n';
import { getPosts, postSlug } from '@lib/content';

export async function getStaticPaths() {
  return LOCALES.map((locale) => ({ params: { locale } }));
}

export const GET: APIRoute = async ({ params, site }) => {
  const locale = params.locale as Locale;
  const strings = t(locale);
  const posts = await getPosts();
  return rss({
    title: `${strings.site.title} (${locale.toUpperCase()})`,
    description: strings.site.tagline,
    site: site ?? 'https://yermilov.github.io',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.summary,
      link: `/${locale}/blog/${postSlug(post)}/`,
      categories: post.data.tags,
    })),
    customData: `<language>${bcp47Locale(locale)}</language>`,
    trailingSlash: true,
  });
};
