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
  nav: { blog: string; lab: string; games: string; talks: string; gallery: string; books: string; about: string };
  site: { title: string; tagline: string; languageName: string; otherLanguageName: string };
  empty: { blog: string; lab: string; games: string; talks: string; gallery: string; books: string };
  books: {
    indexTitle: string;
    indexLede: string;
    backToBooks: string;
    by: string;
    rating: string;
    read: string;
    buy: string;
  };
  home: {
    catchMeAt: string;
    recent: string;
    role: string;
    location: string;
    followLinkedIn: string;
    elsewhere: string;
  };
  talks: {
    nextUp: string;
    past: string;
    recording: string;
    slides: string;
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
    translationPendingFromEn: string;
    translationPendingFromUa: string;
    video: string;
    slides: string;
    repo: string;
    eventPage: string;
    close: string;
    previousPhoto: string;
    nextPhoto: string;
  };
}

const STRINGS: Record<Locale, Strings> = {
  en: {
    nav: { blog: 'Blog', lab: 'Lab', games: 'Games', talks: 'Talks', gallery: 'Gallery', books: 'Books', about: 'About' },
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
      gallery: 'No photos yet.',
      books: 'No books yet.',
    },
    home: {
      catchMeAt: 'Catch me at',
      recent: 'Recent',
      role: 'Principal Software Engineer @ Superhuman',
      location: 'Kyiv, Ukraine',
      followLinkedIn: 'Follow me on LinkedIn',
      elsewhere: 'Elsewhere',
    },
    books: {
      indexTitle: 'Books',
      indexLede: 'Books I’ve read — software engineering, leadership, fiction, the occasional weird gem. Newest first.',
      backToBooks: '← Back to books',
      by: 'by',
      rating: 'Rating',
      read: 'Read',
      buy: 'Buy',
    },
    talks: {
      nextUp: 'Next up',
      past: 'Past',
      recording: 'Recording',
      slides: 'Slides',
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
      translationPendingFromEn: 'This post is not yet translated to Ukrainian. Showing the English original.',
      translationPendingFromUa: 'This post is not yet translated to English. Showing the Ukrainian original.',
      video: 'video',
      slides: 'slides',
      repo: 'repo',
      eventPage: 'event',
      close: 'Close',
      previousPhoto: 'Previous photo',
      nextPhoto: 'Next photo',
    },
  },
  ua: {
    nav: { blog: 'Блог', lab: 'Лаб', games: 'Ігри', talks: 'Доповіді', gallery: 'Галерея', books: 'Книги', about: 'Про' },
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
      gallery: 'Поки нема фото.',
      books: 'Поки нема книг.',
    },
    home: {
      catchMeAt: 'Побачимося',
      recent: 'Нещодавно',
      role: 'Principal Software Engineer @ Superhuman',
      location: 'Київ, Україна',
      followLinkedIn: 'Підписатися в LinkedIn',
      elsewhere: 'У мережі',
    },
    books: {
      indexTitle: 'Книги',
      indexLede: 'Книги, які я прочитав — про інженерію, лідерство, художнє і всякі дивні знахідки. Спершу найновіші.',
      backToBooks: '← До книг',
      by: 'автор —',
      rating: 'Оцінка',
      read: 'Прочитано',
      buy: 'Купити',
    },
    talks: {
      nextUp: 'Далі',
      past: 'Минулі',
      recording: 'Запис',
      slides: 'Слайди',
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
      translationPendingFromEn: 'Цей текст ще не перекладено українською. Показано англійський оригінал.',
      translationPendingFromUa: 'Цей текст ще не перекладено англійською. Показано український оригінал.',
      video: 'відео',
      slides: 'слайди',
      repo: 'репо',
      eventPage: 'подія',
      close: 'Закрити',
      previousPhoto: 'Попереднє фото',
      nextPhoto: 'Наступне фото',
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
