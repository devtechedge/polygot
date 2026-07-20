import type {Metadata} from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PolyGlot Live - Speak Any Language Fluently',
  description: 'Immerse yourself in real-time roleplays with intelligent AI hosts. Master pronunciation, expand your vocabulary, and receive live grammar feedback.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} scroll-smooth`}>
      <body suppressHydrationWarning className="bg-[#F8FAFC] text-[#0F172A] antialiased min-h-screen selection:bg-[#00f0ff]/20">
        {children}
      </body>
    </html>
  );
}

