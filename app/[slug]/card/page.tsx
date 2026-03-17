import { getAllSlugs, getTopicBySlug } from '@/lib/data'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CardClient from './card-client'

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
  return { title: `${topic.title} | Card Mode | Flash Card App` }
}

export default async function CardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ dir?: string }>
}) {
  const { slug } = await params
  const { dir } = await searchParams
  const topic = getTopicBySlug(slug)
  if (!topic) notFound()
  return <CardClient slug={slug} title={topic.title} rawData={topic.questions} dataClass={topic.class} reversed={dir === 'reverse'} />
}
