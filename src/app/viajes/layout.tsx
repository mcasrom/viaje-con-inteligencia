import type { Metadata } from 'next';
export const metadata: Metadata = {
  alternates: { canonical: 'https://www.viajeinteligencia.com/viajes' },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
