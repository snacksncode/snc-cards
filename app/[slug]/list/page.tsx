import { getAllSlugs, getTopicBySlug } from '@/lib/data'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ListClient from './list-client'

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
  return { title: `${topic.title} | List View | Cram` }
}

export default async function ListPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const topic = getTopicBySlug(slug)
  if (!topic) notFound()
  return <ListClient topic={topic} />
}
