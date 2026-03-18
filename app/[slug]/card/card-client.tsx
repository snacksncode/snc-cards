'use client'

import { useState, useEffect, useRef } from 'react'
import FlipCard from '@components/FlipCard'
import EndCard from '@components/EndCard'
import ProgressBar from '@components/ProgressBar'
import useIndexSelectedData from '@hooks/useIndexSelectedData'
import useShuffledData from '@hooks/useShuffledData'
import { AnimatePresence, motion } from 'motion/react'
import useStreak from '@hooks/useStreak'
import { saveSession, loadSession, clearSession, saveScore, getCardStats, updateCardStat } from '@lib/storage'
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
  const [incorrectAnswers, setIncorrectAnswers] = useState<Question[]>([])
  const [correctAnswers, setCorrectAnswers] = useState<Question[]>([])
  const [streak, setStreak, maxStreak, resetStreak] = useStreak()
  const [showHints, setShowHints] = useState<boolean | null>(null)
  const [cardStats, setCardStats] = useState<Record<number, { correct: number; incorrect: number }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const resumeApplied = useRef(false)
  const answerHistory = useRef<boolean[]>([])
  const { data: shuffledData, isShuffled, reshuffle, setOrder } = useShuffledData(displayData, cardStats)
  const {
    selectedItem,
    selectedIndex,
    nextItem,
    prevItem,
    resetIndex,
    amountOfItems,
    progress: { isDone },
    jumpToIndex,
  } = useIndexSelectedData(shuffledData)

  useEffect(() => {
    const init = async () => {
      if (!resume) {
        await clearSession(slug)
      }
      const stats = await getCardStats(slug)
      setCardStats(stats)
      setIsLoading(false)
    }
    init()
  }, [slug, resume])

  useEffect(() => {
    if (isLoading || resumeApplied.current || !resume) return
    const applyResume = async () => {
      const session = await loadSession(slug)
      if (session && session.currentIndex > 0) {
        if (session.shuffleOrder.length > 0) {
          setOrder(session.shuffleOrder)
        }
        const correct = displayData.filter((q) => session.correctIds.includes(q.id))
        const incorrect = displayData.filter((q) => session.incorrectIds.includes(q.id))
        setCorrectAnswers(correct)
        setIncorrectAnswers(incorrect)
        jumpToIndex(session.currentIndex)
      }
      resumeApplied.current = true
    }
    applyResume()
  }, [isLoading, slug, resume, displayData, jumpToIndex, setOrder])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = localStorage.getItem('card-hints-dismissed')
    setShowHints(!dismissed)
  }, [])

  const onAnswer = (rightAnswer: boolean, data: Question) => {
    updateCardStat(slug, data.id, rightAnswer)
    const newCorrectIds = rightAnswer
      ? [...correctAnswers.map((q) => q.id), data.id]
      : correctAnswers.map((q) => q.id)
    const newIncorrectIds = !rightAnswer
      ? [...incorrectAnswers.map((q) => q.id), data.id]
      : incorrectAnswers.map((q) => q.id)
    const nextIndex = selectedIndex + 1
    if (nextIndex >= amountOfItems) {
      clearSession(slug)
      const isFullRun = amountOfItems === rawData.length
      if (isFullRun) {
        const correctCount = rightAnswer ? correctAnswers.length + 1 : correctAnswers.length
        saveScore(slug, { score: Math.round((correctCount / rawData.length) * 100), total: rawData.length, mode: 'cards' })
      }
    } else {
      saveSession(slug, {
        currentIndex: nextIndex,
        shuffleOrder: shuffledData.map((q) => q.id),
        correctIds: newCorrectIds,
        incorrectIds: newIncorrectIds,
        mode: 'cards',
      })
    }
    const stateUpdater = rightAnswer ? setCorrectAnswers : setIncorrectAnswers
    stateUpdater((prevState) => {
      if (prevState == null) return [data]
      return [...prevState, data]
    })
    if (rightAnswer === true) {
      setStreak((c) => c + 1)
    }
    if (rightAnswer === false) {
      setStreak(0)
    }
    answerHistory.current.push(rightAnswer)
    nextItem()
  }

  const handleUndo = () => {
    if (selectedIndex === 0 || answerHistory.current.length === 0) return

    const wasCorrect = answerHistory.current.pop()
    if (wasCorrect === true) {
      setCorrectAnswers((prev) => prev.slice(0, -1))
      setStreak((c) => c - 1)
    } else if (wasCorrect === false) {
      setIncorrectAnswers((prev) => prev.slice(0, -1))
      setStreak(0)
    }

    prevItem()
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
  }, [selectedIndex, correctAnswers, incorrectAnswers])

  const handleRestart = (newData: Question[] | null = null) => {
    resetIndex()
    setIncorrectAnswers([])
    setCorrectAnswers([])
    reshuffle(newData)
    resetStreak()
  }

  const getKeyFromData = (d: Question) => {
    return `${d.id}_${d.question}_${d.answer}`
  }

  if (!rawData || !isShuffled || selectedItem == null || isLoading) return null
  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden">
      {selectedIndex > 0 && !isDone && (
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
        {!isDone ? (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-4">
              <ProgressBar currentAmount={selectedIndex} maxAmount={amountOfItems} streak={streak} />
            </div>
            <AnimatePresence>
              <FlipCard
                key={getKeyFromData(selectedItem)}
                dataClass={dataClass}
                onAnswer={onAnswer}
                data={selectedItem}
              />
            </AnimatePresence>
          </motion.div>
        ) : (
          <EndCard
            key="endcard"
            mode="cards"
            data={{ correct: correctAnswers, incorrect: incorrectAnswers }}
            dataClass={dataClass}
            amount={rawData.length}
            onRestart={handleRestart}
            streak={maxStreak}
          />
        )}
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
