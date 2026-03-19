export type ClassString = 'en' | 'de' | 'geo'

export interface Question {
  id: number
  question: string
  answer: string
}

export interface Topic {
  id: string
  title: string
  slug: string
  class: ClassString
  questions: Question[]
}

export interface SpellingData {
  input: string
  expected: string
  data: Question
}

export interface SpellingReviewData {
  incorrect: SpellingData[]
  correct: SpellingData[]
}

export interface CardsReviewData {
  incorrect: Question[]
  correct: Question[]
}
