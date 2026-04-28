import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SquadBite – Group Food Ordering, Reimagined',
  description: 'Order food together with your squad. AI-powered suggestions, shared cart, smart bill splitting.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'SquadBite',
    description: 'Order food together with your squad',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
