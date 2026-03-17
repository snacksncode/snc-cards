import type { Metadata } from 'next'
import { Poppins, Source_Code_Pro } from 'next/font/google'
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
    <html lang="en" className={`${poppins.variable} ${sourceCodePro.variable}`}>
      <body className="min-h-screen w-screen! overflow-x-hidden flex flex-col bg-bg-300 text-text font-sans">
        {children}
      </body>
    </html>
  )
}
