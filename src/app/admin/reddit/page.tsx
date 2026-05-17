import type { Metadata } from 'next';
import RedditClient from './RedditClient';

export const metadata: Metadata = {
  title: 'Posts Reddit | Administración',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <RedditClient />;
}
