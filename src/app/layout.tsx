import type { Metadata } from 'next';
import './globals.css';
import ContextProvider from '@/context';

export const metadata: Metadata = {
  title: 'Crobet.fun',
  description: 'Crobet.fun Homepage',
  icons: {
    icon: '/crobet.png',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersData = await import('next/headers').then(h => h.headers());
  const cookies = headersData.get('cookie');

  return (
    <html lang="en">
      <body>
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  );
}