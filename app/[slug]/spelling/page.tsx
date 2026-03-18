import { getAllSlugs, getTopicBySlug } from '@/lib/data'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SpellingClient from './spelling-client'

export const dynamicParams = false

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const topic = getTopicBySlug(slug)
  if (!topic) return { title: 'Not Found' }
  return { title: `${topic.title} | Spelling Mode | Flash Card App` }
}

export default async function SpellingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ dir?: string; resume?: string }>
}) {
  const { slug } = await params
  const { dir, resume } = await searchParams
  const topic = getTopicBySlug(slug)
  if (!topic) notFound()
  return <SpellingClient slug={slug} rawData={topic.questions} dataClass={topic.class} reversed={dir === 'reverse'} resume={resume === '1'} />
}
