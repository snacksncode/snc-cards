import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
      <h1 className="text-4xl font-bold text-text">404</h1>
      <p className="text-text-muted text-lg">Page not found</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-accent-gold/15 text-accent-gold border border-accent-gold/30 hover:bg-accent-gold/25 transition-colors text-sm font-medium"
      >
        Go Back Home
      </Link>
    </div>
  )
}
