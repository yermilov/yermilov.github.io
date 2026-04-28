export const LOCALES = ['en', 'uk'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (LOCALES as readonly string[]).includes(value);
}

export function pickLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export interface Strings {
  nav: { blog: string; lab: string; games: string; talks: string; about: string };
  site: { title: string; tagline: string; languageName: string; otherLanguageName: string };
  empty: { blog: string; lab: string; games: string; talks: string };
  labels: {
    published: string;
    updated: string;
    tags: string;
    readMore: string;
    switchLanguage: string;
    backToHome: string;
    search: string;
    controls: string;
    translationPending: string;
  };
  archive: { heading: string; body: string; link: string };
}

const STRINGS: Record<Locale, Strings> = {
  en: {
    nav: { blog: 'Blog', lab: 'Lab', games: 'Games', talks: 'Talks', about: 'About' },
    site: {
      title: 'Yaroslav Yermilov',
      tagline: 'Notes, experiments, talks.',
      languageName: 'English',
      otherLanguageName: 'Ukrainian',
    },
    empty: {
      blog: 'No posts yet.',
      lab: 'No lab entries yet.',
      games: 'No games yet.',
      talks: 'No talks yet.',
    },
    labels: {
      published: 'Published',
      updated: 'Updated',
      tags: 'Tags',
      readMore: 'Read more',
      switchLanguage: 'Switch language',
      backToHome: 'Back to home',
      search: 'Search',
      controls: 'Controls',
      translationPending: 'This post is not yet translated to Ukrainian. Showing the English original.',
    },
    archive: {
      heading: 'Old blog (2017 archive)',
      body: 'A snapshot of the Grain/Octopress blog as it stood in 2017. Preserved as-is.',
      link: 'Visit /old-blog/',
    },
  },
  uk: {
    nav: { blog: 'Блог', lab: 'Лаб', games: 'Ігри', talks: 'Доповіді', about: 'Про' },
    site: {
      title: 'Ярослав Єрмілов',
      tagline: 'Нотатки, експерименти, доповіді.',
      languageName: 'Українська',
      otherLanguageName: 'Англійська',
    },
    empty: {
      blog: 'Поки нема дописів.',
      lab: 'Поки нема записів у лабі.',
      games: 'Поки нема ігор.',
      talks: 'Поки нема доповідей.',
    },
    labels: {
      published: 'Опубліковано',
      updated: 'Оновлено',
      tags: 'Теги',
      readMore: 'Читати далі',
      switchLanguage: 'Змінити мову',
      backToHome: 'На головну',
      search: 'Пошук',
      controls: 'Керування',
      translationPending: 'Цей текст ще не перекладено українською. Показано англійський оригінал.',
    },
    archive: {
      heading: 'Старий блог (архів 2017)',
      body: 'Знімок Grain/Octopress блогу станом на 2017 рік. Збережено як є.',
      link: 'Відкрити /old-blog/',
    },
  },
};

export function t(locale: Locale): Strings {
  return STRINGS[locale];
}

export function localePath(locale: Locale, path = ''): string {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${locale}/${trimmed}/` : `/${locale}/`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'uk' : 'en';
}
