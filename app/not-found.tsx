import { LinkButton } from "@components/Button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
      <h1 className="text-4xl font-bold text-text">404</h1>
      <p className="text-text-muted text-lg">Page not found</p>
      <LinkButton href="/" variant="subtle" accent="var(--color-accent-gold)">
        Go Back Home
      </LinkButton>
    </main>
  );
}
