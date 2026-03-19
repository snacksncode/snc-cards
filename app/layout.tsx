import type { Metadata, Viewport } from 'next'
import { Poppins, Source_Code_Pro, Instrument_Serif } from 'next/font/google'
import LayoutTransition from '@components/LayoutTransition'
import './globals.css'

const poppins = Poppins({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

const sourceCodePro = Source_Code_Pro({
  weight: ['600'],
  subsets: ['latin'],
  variable: '--font-source-code-pro',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
  style: ['normal', 'italic'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Flash Card App',
  description: 'A demo flashcard app for learning vocabulary and more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${sourceCodePro.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen w-screen! overflow-x-hidden flex flex-col bg-bg-300 text-text font-sans">
        <LayoutTransition>
          {children}
        </LayoutTransition>
      </body>
    </html>
  )
}
