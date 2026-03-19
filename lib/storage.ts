import Dexie, { type EntityTable } from 'dexie'

export interface StudySession {
  slug: string
  currentIndex: number
  shuffleOrder: number[]
  correctIds: number[]
  incorrectIds: number[]
  mode: 'cards' | 'spelling'
}

export interface TopicHistory {
  id?: number
  slug: string
  date: string
  score: number
  total: number
  mode: 'cards' | 'spelling'
}

export const db = new Dexie('snc-cards') as Dexie & {
  sessions: EntityTable<StudySession, 'slug'>
  history: EntityTable<TopicHistory, 'id'>
}

db.version(2).stores({
  sessions: 'slug',
  history: '++id, slug, date',
})

export async function saveSession(slug: string, session: Omit<StudySession, 'slug'>): Promise<void> {
  try {
    await db.sessions.put({ slug, ...session })
  } catch (err) {
    console.error('[storage] saveSession:', err)
  }
}

export async function clearSession(slug: string): Promise<void> {
  try {
    await db.sessions.delete(slug)
  } catch (err) {
    console.error('[storage] clearSession:', err)
  }
}

export async function saveScore(slug: string, entry: Omit<TopicHistory, 'id' | 'slug' | 'date'>): Promise<void> {
  try {
    await db.history.add({
      slug,
      date: new Date().toISOString(),
      ...entry,
    })
  } catch (err) {
    console.error('[storage] saveScore:', err)
  }
}

export async function populateAllFakeData(
  topics: { slug: string; questions: { id: number }[] }[]
): Promise<void> {
  try {
    const now = new Date()
    const baseDate = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000)

    const historyEntries: Array<Omit<TopicHistory, 'id'>> = []

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i]
      const numQuestions = topic.questions.length
      const numEntries = 8 + Math.floor(Math.random() * 8)

      for (let j = 0; j < numEntries; j++) {
        const entryDate = new Date(baseDate.getTime() + j * (1.5 * 24 * 60 * 60 * 1000))
        const mode: 'cards' | 'spelling' = j % 3 === 0 ? 'spelling' : 'cards'

        let score: number
        if (j < 3) {
          score = 40 + Math.floor(Math.random() * 25)
        } else if (j < numEntries - 2) {
          score = 70 + Math.floor(Math.random() * 25)
          if (Math.random() < 0.15) score = Math.max(40, score - 30)
        } else {
          score = 85 + Math.floor(Math.random() * 15)
        }

        historyEntries.push({
          slug: topic.slug,
          date: entryDate.toISOString(),
          score,
          total: numQuestions,
          mode,
        })
      }

      if (i < 3) {
        const sessionProgress = Math.floor(Math.random() * (numQuestions - 2)) + 1
        const shuffleOrder = topic.questions.map((q) => q.id)
        for (let k = shuffleOrder.length - 1; k > 0; k--) {
          const j = Math.floor(Math.random() * (k + 1));
          [shuffleOrder[k], shuffleOrder[j]] = [shuffleOrder[j], shuffleOrder[k]]
        }

        const correctCount = Math.floor(sessionProgress * 0.6)
        const correctIds = shuffleOrder.slice(0, correctCount)
        const incorrectIds = shuffleOrder.slice(correctCount, sessionProgress)

        await db.sessions.put({
          slug: topic.slug,
          currentIndex: sessionProgress,
          shuffleOrder,
          correctIds,
          incorrectIds,
          mode: Math.random() < 0.5 ? 'cards' : 'spelling',
        })
      }
    }

    await db.history.bulkAdd(historyEntries)
  } catch (err) {
    console.error('[storage] populateAllFakeData:', err)
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await db.sessions.clear()
    await db.history.clear()
  } catch (err) {
    console.error('[storage] clearAllData:', err)
  }
}
