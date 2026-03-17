import type { Topic } from '@/types'
import topicsData from '../data/topics.json'

const topics = topicsData as Topic[]

export function getAllTopics(): Topic[] {
  return topics
}

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((topic) => topic.slug === slug)
}

export function getAllSlugs(): string[] {
  return topics.map((topic) => topic.slug)
}
