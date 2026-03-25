import type { ClassString } from '@/types'

// Fisher-Yates shuffle
export function shuffle<T>(a: T[]) {
  const aC = a.slice()
  for (let i = aC.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[aC[i], aC[j]] = [aC[j], aC[i]]
  }
  return aC
}

// Generic groupBy utility
export const groupBy = <T, K extends PropertyKey>(
  list: T[],
  getKey: (item: T) => K
) =>
  list.reduce(
    (previous, currentItem) => {
      const group = getKey(currentItem)
      if (!previous[group]) previous[group] = []
      previous[group].push(currentItem)
      return previous
    },
    {} as Record<K, T[]>
  )

// Map ClassString to accent color CSS variable
export function getAccentForClass(cls: ClassString) {
  switch (cls) {
    case 'de':
      return 'var(--color-accent-peachy)'
    case 'en':
      return 'var(--color-accent-blue)'
    case 'geo':
      return 'var(--color-accent-green)'
  }
}

// Map ClassString to human-readable label
export function getHumanReadableClass(cls: ClassString) {
  switch (cls) {
    case 'de':
      return 'German'
    case 'en':
      return 'English'
    case 'geo':
      return 'Geography'
  }
}

// Get fire emoji string based on streak count
export function getStreakEmojis(streak: number): string {
  let multiplicator = 1
  if (streak >= 20) multiplicator = 2
  if (streak >= 40) multiplicator = 3
  if (streak >= 80) multiplicator = 4
  if (streak >= 160) multiplicator = 5
  return '🔥'.repeat(multiplicator)
}

// Calculate card width based on content — shared between FlipCard and SpellingByWord
export function getCardDimensions(question: string, answer: string, windowWidth: number | undefined) {
  if (!windowWidth) return { isMobile: undefined, cardWidth: undefined }
  const contentSize = Math.max(answer.replace(' | ', '').length, question.length)
  let calculatedWidth = Math.max(contentSize * 8 * 2.85 + 128, 350)
  if (calculatedWidth > 1000) calculatedWidth /= 1.75
  const isMobile = windowWidth - 320 < calculatedWidth
  if (isMobile) calculatedWidth = windowWidth - 32
  return { isMobile, cardWidth: calculatedWidth }
}

// Remove diacritics using native String.normalize
export function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}


