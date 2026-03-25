"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "motion/react"
import EndCard from "@/components/EndCard"
import ProgressBar from "@/components/ProgressBar"
import SpellingByWord from "@/components/SpellingByWord"
import { db, saveSession, clearSession, saveScore } from "@lib/storage"
import { useLiveQuery } from "dexie-react-hooks"
import { shuffle, getAccentForClass } from "@lib/utils"
import type { ClassString, Question, SpellingData } from "@/types"

interface SpellingEntry {
  question: Question
  status: 'correct' | 'wrong' | null
  input?: string
  expected?: string
}

interface Props {
  slug: string
  rawData: Question[]
  dataClass: ClassString
  reversed?: boolean
  resume?: boolean
}

export default function SpellingClient({ slug, rawData, dataClass, reversed = false, resume = false }: Props) {
  const displayData = reversed
    ? rawData.map((q) => ({ ...q, question: q.answer, answer: q.question }))
    : rawData

  const [cards, setCards] = useState<SpellingEntry[]>(() =>
    shuffle(displayData).map((q) => ({ question: q, status: null }))
  )

  const session = useLiveQuery(
    () => resume ? db.sessions.get(slug) : undefined,
    [slug, resume]
  )
  const [resumeApplied, setResumeApplied] = useState(false)

  if (resume && session && !resumeApplied) {
    const restored = session.shuffleOrder
      .map((id) => displayData.find((q) => q.id === id))
      .filter((q): q is Question => q != null)
      .map((q) => {
        const isCorrect = session.correctIds.includes(q.id)
        const isWrong = session.incorrectIds.includes(q.id)
        return {
          question: q,
          status: isCorrect ? ('correct' as const) : isWrong ? ('wrong' as const) : null,
          ...(isCorrect ? { input: q.answer, expected: q.answer } : {}),
          ...(isWrong ? { input: '', expected: q.answer } : {}),
        }
      })
    if (restored.length === displayData.length) {
      setCards(restored)
      setResumeApplied(true)
    }
  }

  if (!resume && !resumeApplied) {
    setResumeApplied(true)
  }

  useEffect(() => {
    if (!resume) {
      clearSession(slug)
    }
  }, []) // runs once on mount — if not resuming, clear stale session

  const currentIndex = cards.findIndex((c) => c.status === null)
  const isDone = cards.length > 0 && currentIndex === -1
  const currentCard = currentIndex >= 0 ? cards[currentIndex] : null

  const correctData: SpellingData[] = cards
    .filter((c) => c.status === 'correct')
    .map((c) => ({ input: c.input ?? '', expected: c.expected ?? '', data: c.question }))
  const incorrectData: SpellingData[] = cards
    .filter((c) => c.status === 'wrong')
    .map((c) => ({ input: c.input ?? '', expected: c.expected ?? '', data: c.question }))

  const answered = cards.filter((c) => c.status !== null)
  let streak = 0
  for (let i = answered.length - 1; i >= 0; i--) {
    if (answered[i].status === 'correct') streak++
    else break
  }
  let maxStreak = 0
  let run = 0
  for (const c of answered) {
    if (c.status === 'correct') {
      run++
      if (run > maxStreak) maxStreak = run
    } else {
      run = 0
    }
  }

  const onAnswer = (answeredRight: boolean, input: string, expected: string, _question: Question) => {
    if (currentIndex === -1) return

    const newCards = cards.map((c, i) =>
      i === currentIndex ? { ...c, status: answeredRight ? ('correct' as const) : ('wrong' as const), input, expected } : c
    )
    setCards(newCards)

    const nextIdx = newCards.findIndex((c) => c.status === null)
    if (nextIdx === -1) {
      clearSession(slug)
      if (newCards.length === rawData.length) {
        const correctCount = newCards.filter((c) => c.status === 'correct').length
        saveScore(slug, { score: Math.round((correctCount / rawData.length) * 100), total: rawData.length, mode: "spelling" })
      }
    } else {
      saveSession(slug, {
        currentIndex: nextIdx,
        shuffleOrder: newCards.map((c) => c.question.id),
        correctIds: newCards.filter((c) => c.status === 'correct').map((c) => c.question.id),
        incorrectIds: newCards.filter((c) => c.status === 'wrong').map((c) => c.question.id),
        mode: "spelling",
      })
    }
  }

  const handleRestart = (retryData: Question[] | null = null) => {
    const dataToShuffle = retryData ?? displayData
    setCards(shuffle(dataToShuffle).map((q) => ({ question: q, status: null })))
  }

  if (resume && !resumeApplied) return null
  return (
    <main className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!isDone && currentCard ? (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProgressBar currentAmount={answered.length} maxAmount={cards.length} streak={streak} accentColor={getAccentForClass(dataClass)} />
            <AnimatePresence>
              <SpellingByWord
                data={currentCard.question}
                onAnswer={onAnswer}
                key={`${currentCard.question.id}_${currentCard.question.question}`}
              />
            </AnimatePresence>
          </motion.div>
        ) : isDone ? (
          <EndCard
            key="endcard"
            mode="spelling"
            dataClass={dataClass}
            data={{ incorrect: incorrectData, correct: correctData }}
            amount={rawData.length}
            onRestart={handleRestart}
            streak={maxStreak}
            slug={slug}
          />
        ) : null}
      </AnimatePresence>
    </main>
  )
}
