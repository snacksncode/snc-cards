import { getAllTopics } from '@/lib/data'
import type { Metadata } from 'next'
import HomeClient from './home-client'

export const metadata: Metadata = {
  title: 'Cram: Study Cards',
  description: 'A flashcard app for drilling vocabulary.',
}

export default function HomePage() {
  const topics = getAllTopics()
  return <HomeClient topics={topics} />
}
