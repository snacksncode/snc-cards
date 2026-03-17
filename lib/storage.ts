const STORAGE_VERSION = 1
const STORAGE_KEY = 'snc-cards-v1'

interface CardStat {
  correct: number
  incorrect: number
}

interface StudySession {
  currentIndex: number
  shuffleOrder: number[]
  correctIds: number[]
  incorrectIds: number[]
  mode: 'cards' | 'spelling'
}

interface TopicHistory {
  date: string
  score: number
  total: number
  mode: 'cards' | 'spelling'
}

interface TopicData {
  session: StudySession | null
  history: TopicHistory[]
  cardStats: Record<number, CardStat>
}

interface StorageData {
  version: number
  topics: Record<string, TopicData>
}

function freshTopicData(): TopicData {
  return { session: null, history: [], cardStats: {} }
}

function freshStorage(): StorageData {
  return { version: STORAGE_VERSION, topics: {} }
}

function getStorage(): StorageData {
  if (typeof window === 'undefined') return freshStorage()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshStorage()
    const parsed = JSON.parse(raw) as StorageData
    if (parsed.version !== STORAGE_VERSION) return freshStorage()
    return parsed
  } catch {
    return freshStorage()
  }
}

function setStorage(data: StorageData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function ensureTopic(data: StorageData, slug: string): TopicData {
  if (!data.topics[slug]) {
    data.topics[slug] = freshTopicData()
  }
  return data.topics[slug]
}

export function saveSession(slug: string, session: StudySession): void {
  if (typeof window === 'undefined') return
  const data = getStorage()
  ensureTopic(data, slug).session = session
  setStorage(data)
}

export function loadSession(slug: string): StudySession | null {
  if (typeof window === 'undefined') return null
  return ensureTopic(getStorage(), slug).session
}

export function clearSession(slug: string): void {
  if (typeof window === 'undefined') return
  const data = getStorage()
  ensureTopic(data, slug).session = null
  setStorage(data)
}

export function saveScore(slug: string, entry: Omit<TopicHistory, 'date'>): void {
  if (typeof window === 'undefined') return
  const data = getStorage()
  ensureTopic(data, slug).history.push({
    ...entry,
    date: new Date().toISOString(),
  })
  setStorage(data)
}

export function getScoreHistory(slug: string): TopicHistory[] {
  if (typeof window === 'undefined') return []
  return ensureTopic(getStorage(), slug).history
}

export function getCardStats(slug: string): Record<number, CardStat> {
  if (typeof window === 'undefined') return {}
  return ensureTopic(getStorage(), slug).cardStats
}

export function updateCardStat(slug: string, questionId: number, correct: boolean): void {
  if (typeof window === 'undefined') return
  const data = getStorage()
  const stats = ensureTopic(data, slug).cardStats
  if (!stats[questionId]) {
    stats[questionId] = { correct: 0, incorrect: 0 }
  }
  if (correct) {
    stats[questionId].correct++
  } else {
    stats[questionId].incorrect++
  }
  setStorage(data)
}
