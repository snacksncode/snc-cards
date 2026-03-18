'use client'

import { useState, useEffect } from 'react'
import FlipCard from '@components/FlipCard'
import EndCard from '@components/EndCard'
import ProgressBar from '@components/ProgressBar'
import { AnimatePresence, motion } from 'motion/react'
import { db, saveSession, clearSession, saveScore } from '@lib/storage'
import { useLiveQuery } from 'dexie-react-hooks'
import { shuffle } from '@lib/utils'
import type { ClassString, Question } from '@/types'

const Shortcut = ({ keys, action }: { keys: string[]; action: string }) => (
  <div className="flex items-center gap-2">
    {keys.map((key, i) => (
      <div key={key} className="flex items-center gap-1">
        <kbd className="px-2 py-1 text-xs font-medium bg-bg-400 border border-bg-600 rounded text-text-secondary">
          {key}
        </kbd>
        {i < keys.length - 1 && <span className="text-text-muted">/</span>}
      </div>
    ))}
    <span className="text-text-muted text-xs ml-1">{action}</span>
  </div>
)

interface CardEntry {
  question: Question
  status: 'correct' | 'wrong' | null
}

interface Props {
  slug: string
  rawData: Question[]
  dataClass: ClassString
  reversed?: boolean
  resume?: boolean
}

export default function CardClient({ slug, rawData, dataClass, reversed = false, resume = false }: Props) {
  const displayData = reversed
    ? rawData.map((q) => ({ ...q, question: q.answer, answer: q.question }))
    : rawData

  const [cards, setCards] = useState<CardEntry[]>(() =>
    shuffle(displayData).map((q) => ({ question: q, status: null }))
  )
  const [showHints, setShowHints] = useState<boolean | null>(null)

  const session = useLiveQuery(
    () => resume ? db.sessions.get(slug) : undefined,
    [slug, resume]
  )
  const [resumeApplied, setResumeApplied] = useState(false)

  if (resume && session && !resumeApplied) {
    const restored = session.shuffleOrder
      .map((id) => displayData.find((q) => q.id === id))
      .filter((q): q is Question => q != null)
      .map((q) => ({
        question: q,
        status: session.correctIds.includes(q.id)
          ? ('correct' as const)
          : session.incorrectIds.includes(q.id)
            ? ('wrong' as const)
            : null,
      }))
    if (restored.length === displayData.length) {
      setCards(restored)
      setResumeApplied(true)
    }
  }

  if (!resume && !resumeApplied) {
    clearSession(slug)
    setResumeApplied(true)
  }

  const currentIndex = cards.findIndex((c) => c.status === null)
  const isDone = cards.length > 0 && currentIndex === -1
  const currentCard = currentIndex >= 0 ? cards[currentIndex] : null
  const correctQuestions = cards.filter((c) => c.status === 'correct').map((c) => c.question)
  const incorrectQuestions = cards.filter((c) => c.status === 'wrong').map((c) => c.question)

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = localStorage.getItem('card-hints-dismissed')
    setShowHints(!dismissed)
  }, [])

  const onAnswer = (rightAnswer: boolean, _question: Question) => {
    if (currentIndex === -1) return

    const newCards = cards.map((c, i) =>
      i === currentIndex ? { ...c, status: rightAnswer ? ('correct' as const) : ('wrong' as const) } : c
    )
    setCards(newCards)

    const nextIdx = newCards.findIndex((c) => c.status === null)
    if (nextIdx === -1) {
      clearSession(slug)
      if (newCards.length === rawData.length) {
        const correctCount = newCards.filter((c) => c.status === 'correct').length
        saveScore(slug, { score: Math.round((correctCount / rawData.length) * 100), total: rawData.length, mode: 'cards' })
      }
    } else {
      saveSession(slug, {
        currentIndex: nextIdx,
        shuffleOrder: newCards.map((c) => c.question.id),
        correctIds: newCards.filter((c) => c.status === 'correct').map((c) => c.question.id),
        incorrectIds: newCards.filter((c) => c.status === 'wrong').map((c) => c.question.id),
        mode: 'cards',
      })
    }
  }

  const handleUndo = () => {
    const lastAnsweredIdx = cards.reduceRight<number>((found, c, i) => found >= 0 ? found : c.status !== null ? i : -1, -1)
    if (lastAnsweredIdx === -1) return
    setCards((prev) => prev.map((c, i) => i === lastAnsweredIdx ? { ...c, status: null } : c))
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showHints) {
        setShowHints(false)
        localStorage.setItem('card-hints-dismissed', 'true')
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cards, showHints])

  const handleRestart = (retryData: Question[] | null = null) => {
    const dataToShuffle = retryData ?? displayData
    setCards(shuffle(dataToShuffle).map((q) => ({ question: q, status: null })))
  }

  if (resume && !resumeApplied) return null
  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden">
      {answered.length > 0 && !isDone && (
        <button
          onClick={handleUndo}
          className="fixed top-4 left-4 flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors px-3 py-1.5 rounded-lg bg-bg-500 border border-bg-600 hover:border-text-muted cursor-pointer z-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
          Undo
        </button>
      )}
      <AnimatePresence mode="wait">
        {!isDone && currentCard ? (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-4">
              <ProgressBar currentAmount={answered.length} maxAmount={cards.length} streak={streak} />
            </div>
            <AnimatePresence>
              <FlipCard
                key={`${currentCard.question.id}_${currentCard.question.question}_${currentCard.question.answer}`}
                dataClass={dataClass}
                onAnswer={onAnswer}
                data={currentCard.question}
              />
            </AnimatePresence>
          </motion.div>
        ) : isDone ? (
          <EndCard
            key="endcard"
            mode="cards"
            data={{ correct: correctQuestions, incorrect: incorrectQuestions }}
            dataClass={dataClass}
            amount={rawData.length}
            onRestart={handleRestart}
            streak={maxStreak}
          />
        ) : null}
      </AnimatePresence>
      <button
        onClick={() => setShowHints(true)}
        className="fixed bottom-4 right-4 w-10 h-10 rounded-full bg-bg-500 border border-bg-600 flex items-center justify-center text-text-muted hover:text-text hover:border-text-muted transition-colors cursor-pointer z-40"
        aria-label="Show keyboard shortcuts"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => {
              setShowHints(false)
              localStorage.setItem('card-hints-dismissed', 'true')
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-400 border border-bg-600 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text m-0">Keyboard Shortcuts</h3>
                <button
                  onClick={() => {
                    setShowHints(false)
                    localStorage.setItem('card-hints-dismissed', 'true')
                  }}
                  className="text-text-muted hover:text-text transition-colors cursor-pointer bg-transparent border-none p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <Shortcut keys={['Enter']} action="flip card" />
                <Shortcut keys={['Enter']} action="mark correct (after flip)" />
                <Shortcut keys={['Backspace']} action="mark wrong (after flip)" />
                <Shortcut keys={['Esc']} action="unflip card" />
                <Shortcut keys={['⌘Z', 'Ctrl+Z']} action="undo last answer" />
              </div>
              <p className="text-text-muted text-xs mt-4 m-0">
                Click the <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-bg-600 text-[10px]">?</span> button to see this again.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
