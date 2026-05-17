import { useEffect, useState } from 'react';

interface Props {
  /** Talk date as an ISO string (Astro Date serializes to one across the island boundary). */
  iso: string;
  /** BCP 47 locale (e.g. `en-US`, `uk-UA`) for Intl.RelativeTimeFormat. */
  bcp47: string;
  /** Build-time formatted string. Used for SSR + the initial hydration render. */
  fallback: string;
  /** Build-time day offset. Used for SSR bucket so the highlight class matches between server + client. */
  serverDays: number;
}

type Bucket = 'today' | 'tomorrow' | 'yesterday' | 'other';

function bucketOf(days: number): Bucket {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  return 'other';
}

function daysBetween(iso: string): number {
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export default function RelativeDays({ iso, bcp47, fallback, serverDays }: Props) {
  const [state, setState] = useState({ text: fallback, days: serverDays });
  useEffect(() => {
    const days = daysBetween(iso);
    const rtf = new Intl.RelativeTimeFormat(bcp47, { numeric: 'auto' });
    setState({ text: rtf.format(days, 'day'), days });
  }, [iso, bcp47]);
  return <span className={`rel-days rel-days--${bucketOf(state.days)}`}>{state.text}</span>;
}
