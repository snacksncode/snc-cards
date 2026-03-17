import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
      <h1 className="text-4xl font-bold text-accent-red">404</h1>
      <p className="text-text-muted text-lg">Page not found</p>
      <Link
        href="/"
        className="px-6 py-2 rounded border-2 border-accent-blue text-accent-blue font-bold hover:bg-accent-blue hover:text-bg-200 transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  )
}
