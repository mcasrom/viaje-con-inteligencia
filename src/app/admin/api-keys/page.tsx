import { Metadata } from 'next';
import ApiKeysClient from './ApiKeysClient';

export const metadata: Metadata = {
  title: 'API Keys | Administración',
  robots: { index: false },
};

export default function Page() {
  return <ApiKeysClient />;
}
