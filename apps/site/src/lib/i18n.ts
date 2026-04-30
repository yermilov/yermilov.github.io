export const LOCALES = ['en', 'ua'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (LOCALES as readonly string[]).includes(value);
}

export function pickLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * URL/content uses `ua` (since "UK" reads as United Kingdom to Ukrainian
 * readers), but BCP 47 / hreflang / Intl APIs require ISO 639-1 `uk`.
 * These helpers map between the two.
 */
const LANG_TAGS: Record<Locale, { bcp47: string; og: string; html: string }> = {
  en: { bcp47: 'en-US', og: 'en_US', html: 'en' },
  ua: { bcp47: 'uk-UA', og: 'uk_UA', html: 'uk' },
};

export function bcp47Locale(locale: Locale): string {
  return LANG_TAGS[locale].bcp47;
}
export function ogLocale(locale: Locale): string {
  return LANG_TAGS[locale].og;
}
export function htmlLang(locale: Locale): string {
  return LANG_TAGS[locale].html;
}

export interface Strings {
  nav: { blog: string; lab: string; games: string; talks: string; about: string };
  site: { title: string; tagline: string; languageName: string; otherLanguageName: string };
  empty: { blog: string; lab: string; games: string; talks: string };
  home: {
    catchMeAt: string;
    recent: string;
    role: string;
    location: string;
  };
  talks: {
    nextUp: string;
    past: string;
    recording: string;
    photos: string;
    backToTalks: string;
  };
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
    video: string;
    slides: string;
    repo: string;
    eventPage: string;
    close: string;
    previousPhoto: string;
    nextPhoto: string;
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
    home: {
      catchMeAt: 'Catch me at',
      recent: 'Recent',
      role: 'Principal Software Engineer @ Superhuman',
      location: 'Kyiv, Ukraine',
    },
    talks: {
      nextUp: 'Next up',
      past: 'Past',
      recording: 'Recording',
      photos: 'Photos',
      backToTalks: '← Back to talks',
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
      video: 'video',
      slides: 'slides',
      repo: 'repo',
      eventPage: 'event',
      close: 'Close',
      previousPhoto: 'Previous photo',
      nextPhoto: 'Next photo',
    },
    archive: {
      heading: 'Old blog (2017 archive)',
      body: 'A snapshot of the Grain/Octopress blog as it stood in 2017. Preserved as-is.',
      link: 'Visit /old-blog/',
    },
  },
  ua: {
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
    home: {
      catchMeAt: 'Побачимося',
      recent: 'Нещодавно',
      role: 'Principal Software Engineer @ Superhuman',
      location: 'Київ, Україна',
    },
    talks: {
      nextUp: 'Далі',
      past: 'Минулі',
      recording: 'Запис',
      photos: 'Фото',
      backToTalks: '← До доповідей',
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
      video: 'відео',
      slides: 'слайди',
      repo: 'репо',
      eventPage: 'подія',
      close: 'Закрити',
      previousPhoto: 'Попереднє фото',
      nextPhoto: 'Наступне фото',
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

/** Display badge for a content language. */
export function languageBadge(language: Locale): string {
  return language.toUpperCase();
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'ua' : 'en';
}
