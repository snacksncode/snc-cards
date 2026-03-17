import { getAllTopics } from '@/lib/data'
import type { Metadata } from 'next'
import HomeClient from './home-client'

export const metadata: Metadata = {
  title: 'Flash Card App',
  description: 'A demo flashcard app for learning vocabulary.',
}

export default function HomePage() {
  const topics = getAllTopics()
  return <HomeClient topics={topics} />
}
