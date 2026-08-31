import type { Metadata } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PolyGlot Live — Spanish speaking lab',
  description:
    'Live Spanish roleplay with AI hosts. Practice tapas orders, bike rentals, and interviews. IPA, grammar toasts, and a fluency scorecard.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
}

const THEME_BOOT = `(function(){try{var k="polygot-theme";var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark")t="light";var r=document.documentElement;r.setAttribute("data-theme",t);r.style.colorScheme=t;if(t==="dark")r.classList.add("dark");else r.classList.remove("dark");}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body
        suppressHydrationWarning
        className="bg-[#F8FAFC] text-[#0F172A] antialiased min-h-screen selection:bg-[#00f0ff]/20"
      >
        {children}
      </body>
    </html>
  )
}
