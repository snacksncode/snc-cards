'use client'

import { useState, useEffect } from 'react'
import FlipCard from '@components/FlipCard'
import EndCard from '@components/EndCard'
import ProgressBar from '@components/ProgressBar'
import { AnimatePresence, motion } from 'motion/react'
import { Popover } from '@base-ui/react/popover'
import { Button } from '@components/Button'
import { db, saveSession, clearSession, saveScore } from '@lib/storage'
import { useLiveQuery } from 'dexie-react-hooks'
import { shuffle, getAccentForClass } from '@lib/utils'
import type { ClassString, Question } from '@/types'

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="bg-bg-500 rounded-sm px-2 py-1 text-xs font-bold text-text-muted shadow-[0_3px_0_var(--color-bg-600)] inline-flex items-center justify-center min-w-[28px]">
    {children}
  </kbd>
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
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [isMac, setIsMac] = useState(false)

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
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform))
  }, [])

  useEffect(() => {
    const dismissed = localStorage.getItem('shortcuts-dismissed')
    if (!dismissed && window.innerWidth >= 640) setShortcutsOpen(true)
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
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cards])

  const handleRestart = (retryData: Question[] | null = null) => {
    const dataToShuffle = retryData ?? displayData
    setCards(shuffle(dataToShuffle).map((q) => ({ question: q, status: null })))
  }

  if (resume && !resumeApplied) return null
  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden">
      {answered.length > 0 && !isDone && (
        <Button
          variant="neutral"
          size="sm"
          onClick={handleUndo}
          className="fixed top-4 left-4 z-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
          Undo
        </Button>
      )}
      <AnimatePresence mode="wait">
        {!isDone && currentCard ? (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-4">
              <ProgressBar currentAmount={answered.length} maxAmount={cards.length} streak={streak} accentColor={getAccentForClass(dataClass)} />
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
      <Popover.Root
        open={shortcutsOpen}
        onOpenChange={(open) => {
          setShortcutsOpen(open)
          if (!open) localStorage.setItem('shortcuts-dismissed', 'true')
        }}
      >
        <Popover.Trigger className="fixed bottom-4 right-4 w-10 h-10 rounded-full bg-bg-500 border border-bg-600 flex items-center justify-center text-text-muted hover:text-text cursor-pointer z-40 max-sm:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </Popover.Trigger>
        <AnimatePresence>
          {shortcutsOpen && (
            <Popover.Portal keepMounted>
              <Popover.Positioner sideOffset={8} side="top" align="end">
                <Popover.Popup
                  render={
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    />
                  }
                  className="bg-bg-300 border border-bg-600 rounded-xl p-4 w-[280px] shadow-lg z-40"
                >
                  <span className="text-[0.6rem] font-semibold text-text-muted tracking-[0.08em] uppercase block mb-4">Shortcuts</span>
                  <div className="flex flex-col items-center gap-0">
                    <div className="flex flex-col items-center">
                      <Kbd>Enter</Kbd>
                      <span className="text-[0.6rem] text-text-muted mt-1">flip card</span>
                      <div className="w-px h-3 bg-bg-600 mt-1" />
                      <div className="flex items-start gap-6 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] h-px bg-bg-600" />
                        <div className="flex flex-col items-center pt-2 relative">
                          <div className="w-px h-2 bg-bg-600 absolute -top-0 left-1/2 -translate-x-1/2" />
                          <Kbd>Enter</Kbd>
                          <span className="text-[0.6rem] text-accent-green mt-1">correct</span>
                        </div>
                        <div className="flex flex-col items-center pt-2 relative">
                          <div className="w-px h-2 bg-bg-600 absolute -top-0 left-1/2 -translate-x-1/2" />
                          <Kbd>Backspace</Kbd>
                          <span className="text-[0.6rem] text-accent-red mt-1">wrong</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-px bg-bg-600 my-3" />
                    <div className="flex items-center justify-between w-full gap-4">
                      <div className="flex items-center gap-2">
                        <Kbd>Esc</Kbd>
                        <span className="text-[0.6rem] text-text-muted">unflip</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Kbd>{isMac ? '⌘Z' : 'Ctrl+Z'}</Kbd>
                        <span className="text-[0.6rem] text-text-muted">undo</span>
                      </div>
                    </div>
                  </div>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          )}
        </AnimatePresence>
      </Popover.Root>
    </div>
  )
}
