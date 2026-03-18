import Dexie, { type EntityTable } from 'dexie'

interface CardStat {
  correct: number
  incorrect: number
}

interface StudySession {
  slug: string
  currentIndex: number
  shuffleOrder: number[]
  correctIds: number[]
  incorrectIds: number[]
  mode: 'cards' | 'spelling'
}

interface TopicHistory {
  id?: number
  slug: string
  date: string
  score: number
  total: number
  mode: 'cards' | 'spelling'
}

interface TopicCardStat {
  slug: string
  cardId: number
  correct: number
  incorrect: number
}

const db = new Dexie('snc-cards') as Dexie & {
  sessions: EntityTable<StudySession, 'slug'>
  history: EntityTable<TopicHistory, 'id'>
  cardStats: EntityTable<TopicCardStat, 'slug' | 'cardId'>
}

db.version(1).stores({
  sessions: 'slug',
  history: '++id, slug, date',
  cardStats: '[slug+cardId]',
})

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export async function saveSession(slug: string, session: Omit<StudySession, 'slug'>): Promise<void> {
  if (!isClient()) return
  try {
    await db.sessions.put({ slug, ...session })
  } catch (err) {
    console.error('[storage] saveSession:', err)
  }
}

export async function loadSession(slug: string): Promise<Omit<StudySession, 'slug'> | null> {
  if (!isClient()) return null
  try {
    const session = await db.sessions.get(slug)
    if (!session) return null
    const { slug: _, ...rest } = session
    return rest
  } catch (err) {
    console.error('[storage] loadSession:', err)
    return null
  }
}

export async function clearSession(slug: string): Promise<void> {
  if (!isClient()) return
  try {
    await db.sessions.delete(slug)
  } catch (err) {
    console.error('[storage] clearSession:', err)
  }
}

export async function saveScore(slug: string, entry: Omit<TopicHistory, 'id' | 'slug' | 'date'>): Promise<void> {
  if (!isClient()) return
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

export async function getScoreHistory(slug: string): Promise<Omit<TopicHistory, 'id' | 'slug'>[]> {
  if (!isClient()) return []
  try {
    const records = await db.history.where('slug').equals(slug).toArray()
    return records.map(({ date, score, total, mode }) => ({ date, score, total, mode }))
  } catch (err) {
    console.error('[storage] getScoreHistory:', err)
    return []
  }
}

export async function getCardStats(slug: string): Promise<Record<number, CardStat>> {
  if (!isClient()) return {}
  try {
    const records = await db.cardStats.where('[slug+cardId]').between([slug, Dexie.minKey], [slug, Dexie.maxKey]).toArray()
    const result: Record<number, CardStat> = {}
    for (const r of records) {
      result[r.cardId] = { correct: r.correct, incorrect: r.incorrect }
    }
    return result
  } catch (err) {
    console.error('[storage] getCardStats:', err)
    return {}
  }
}

export async function updateCardStat(slug: string, cardId: number, correct: boolean): Promise<void> {
  if (!isClient()) return
  try {
    const existing = await db.cardStats.where({ slug, cardId }).first()
    if (existing) {
      await db.cardStats.where({ slug, cardId }).modify((stat) => {
        if (correct) stat.correct++
        else stat.incorrect++
      })
    } else {
      await db.cardStats.add({
        slug,
        cardId,
        correct: correct ? 1 : 0,
        incorrect: correct ? 0 : 1,
      })
    }
  } catch (err) {
    console.error('[storage] updateCardStat:', err)
  }
}

export async function populateAllFakeData(
  topics: { slug: string; questions: { id: number }[] }[]
): Promise<void> {
  if (!isClient()) return
  try {
    const now = new Date()
    const baseDate = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000)

    const historyEntries: Array<Omit<TopicHistory, 'id'>> = []
    const cardStatsEntries: TopicCardStat[] = []

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i]
      const numQuestions = topic.questions.length
      const numEntries = 8 + Math.floor(Math.random() * 8)

      for (let j = 0; j < numEntries; j++) {
        const entryDate = new Date(baseDate.getTime() + j * (1.5 * 24 * 60 * 60 * 1000))
        const mode = j % 3 === 0 ? 'spelling' : 'cards'

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
          mode: mode as 'cards' | 'spelling',
        })
      }

      if (i < 3) {
        const sessionProgress = Math.floor(Math.random() * (numQuestions - 2)) + 1
        const shuffleOrder = Array.from({ length: numQuestions }, (_, idx) => idx)
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

      if (i < 3) {
        const cardStatsCount = Math.floor(Math.random() * 3) + 2
        const selectedCards = shuffleArray(topic.questions.slice()).slice(0, cardStatsCount)

        for (const card of selectedCards) {
          const correct = Math.floor(Math.random() * 8) + 2
          const incorrect = Math.floor(Math.random() * 5)
          cardStatsEntries.push({
            slug: topic.slug,
            cardId: card.id,
            correct,
            incorrect,
          })
        }
      }
    }

    await db.history.bulkAdd(historyEntries)
    await db.cardStats.bulkAdd(cardStatsEntries)
  } catch (err) {
    console.error('[storage] populateAllFakeData:', err)
  }
}

export async function clearAllData(): Promise<void> {
  if (!isClient()) return
  try {
    await db.sessions.clear()
    await db.history.clear()
    await db.cardStats.clear()
  } catch (err) {
    console.error('[storage] clearAllData:', err)
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
