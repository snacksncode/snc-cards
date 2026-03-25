'use client'

import { useState, useEffect } from 'react'
import FlipCard from '@components/FlipCard'
import EndCard from '@components/EndCard'
import ProgressBar from '@components/ProgressBar'
import { AnimatePresence, motion } from 'motion/react'
import { useRef } from 'react'
import { Button } from '@components/Button'
import { db, saveSession, clearSession, saveScore } from '@lib/storage'
import { useLiveQuery } from 'dexie-react-hooks'
import { shuffle, getAccentForClass } from '@lib/utils'
import type { ClassString, Question } from '@/types'

const ShortcutsDiagram = ({ isMac }: { isMac: boolean }) => {
  const bg500 = 'var(--color-bg-500)'
  const bg600 = 'var(--color-bg-600)'
  const muted = 'var(--color-text-muted)'
  const green = 'var(--color-accent-green)'
  const red = 'var(--color-accent-red)'

  const key = (x: number, y: number, text: string, w = 44) => (
    <g>
      <rect x={x - w / 2} y={y + 3} width={w} height={24} rx={4} fill={bg600} />
      <rect x={x - w / 2} y={y} width={w} height={24} rx={4} fill={bg500} />
      <text x={x} y={y + 12} textAnchor="middle" dominantBaseline="central" fill={muted} fontSize={11} fontWeight={700} fontFamily="inherit">{text}</text>
    </g>
  )

  const label = (x: number, y: number, text: string, color = muted) => (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={color} fontSize={10} fontFamily="inherit">{text}</text>
  )

  const undoKey = isMac ? '⌘' : 'Ctrl'
  const undoW = isMac ? 30 : 40

  return (
    <svg viewBox="0 0 280 224" width="100%" className="block">
      {label(140, 12, 'SHORTCUTS', muted)}

      {key(140, 30, 'Enter', 54)}
      {label(140, 68, 'flip card')}

      <line x1={140} y1={76} x2={140} y2={90} stroke={bg600} strokeWidth={1} />
      <line x1={68} y1={90} x2={212} y2={90} stroke={bg600} strokeWidth={1} />
      <line x1={68} y1={90} x2={68} y2={104} stroke={bg600} strokeWidth={1} />
      <line x1={212} y1={90} x2={212} y2={104} stroke={bg600} strokeWidth={1} />

      {key(68, 104, 'Enter', 54)}
      {label(68, 142, 'correct', green)}

      {key(212, 104, 'Backspace', 74)}
      {label(212, 142, 'wrong', red)}

      <line x1={16} y1={160} x2={264} y2={160} stroke={bg600} strokeWidth={1} />

      {key(68, 174, 'Esc', 40)}
      {label(68, 208, 'unflip')}

      {key(192, 174, undoKey, undoW)}
      {key(192 + undoW / 2 + 20, 174, 'Z', 30)}
      {label(192 + undoW / 4 + 10, 208, 'undo')}
    </svg>
  )
}

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
  const [shortcutsVisible, setShortcutsVisible] = useState(false)
  const shortcutsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMac = useRef(false)
  const startTimeRef = useRef<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

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
    setResumeApplied(true)
  }

  useEffect(() => {
    if (!resume) {
      clearSession(slug)
    }
  }, []) // runs once on mount — if not resuming, clear stale session

  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
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
    isMac.current = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
  }, [])

  const onAnswer = (rightAnswer: boolean, _question: Question) => {
    if (currentIndex === -1) return
    setDirection('forward')

    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
    }

    const newCards = cards.map((c, i) =>
      i === currentIndex ? { ...c, status: rightAnswer ? ('correct' as const) : ('wrong' as const) } : c
    )
    setCards(newCards)

    const nextIdx = newCards.findIndex((c) => c.status === null)
    if (nextIdx === -1) {
      setElapsedTime(Math.round((Date.now() - startTimeRef.current!) / 1000))
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
    setDirection('backward')
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
    startTimeRef.current = null
    setElapsedTime(0)
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
          onClick={(e) => { handleUndo(); (e.currentTarget as HTMLElement).blur() }}
          tabIndex={-1}
          className="fixed left-4 max-lg:bottom-4 lg:top-4 z-40"
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
            <AnimatePresence custom={direction}>
              <FlipCard
                key={`${currentCard.question.id}_${currentCard.question.question}_${currentCard.question.answer}`}
                dataClass={dataClass}
                onAnswer={onAnswer}
                data={currentCard.question}
                direction={direction}
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
            slug={slug}
            elapsedTime={elapsedTime}
          />
        ) : null}
      </AnimatePresence>
      <div
        className="fixed bottom-4 right-4 z-40 max-sm:hidden"
        onMouseEnter={() => {
          if (shortcutsTimeout.current) clearTimeout(shortcutsTimeout.current)
          setShortcutsVisible(true)
        }}
        onMouseLeave={() => {
          shortcutsTimeout.current = setTimeout(() => setShortcutsVisible(false), 150)
        }}
      >
        <button
          type="button"
          aria-label="Keyboard shortcuts"
          aria-expanded={shortcutsVisible}
          className="appearance-none bg-transparent border-none p-0 w-10 h-10 rounded-full bg-bg-500 border border-bg-600 flex items-center justify-center text-text-muted hover:text-text cursor-pointer"
          onFocus={() => setShortcutsVisible(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setShortcutsVisible((v) => !v)
            } else if (e.key === 'Escape') {
              e.preventDefault()
              setShortcutsVisible(false)
              ;(e.currentTarget as HTMLElement).blur()
            }
          }}
          onBlur={() => setShortcutsVisible(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
        <AnimatePresence>
          {shortcutsVisible && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-12 right-0 bg-bg-300 border border-bg-600 rounded-xl p-4 w-[340px] shadow-lg"
            >
              <ShortcutsDiagram isMac={isMac.current} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
