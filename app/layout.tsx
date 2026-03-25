import type { Metadata } from 'next'
import { Poppins, Source_Code_Pro, Instrument_Serif } from 'next/font/google'
import LayoutTransition from '@components/LayoutTransition'
import Providers from '@components/Providers'
import './globals.css'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

const sourceCodePro = Source_Code_Pro({
  weight: ['400', '600', '700'],
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
    <html lang="en" className={`${poppins.variable} ${sourceCodePro.variable} ${instrumentSerif.variable} [scrollbar-gutter:stable]`}>
      <body className="min-h-screen overflow-x-hidden flex flex-col bg-bg-300 text-text font-sans">
        <Providers>
          <div style={{ isolation: 'isolate' }}>
            <LayoutTransition>
              {children}
            </LayoutTransition>
          </div>
        </Providers>
      </body>
    </html>
  )
}
