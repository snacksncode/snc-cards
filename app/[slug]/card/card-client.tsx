'use client'

import { useState, useEffect } from 'react'
import FlipCard from '@components/FlipCard'
import EndCard from '@components/EndCard'
import ProgressBar from '@components/ProgressBar'
import useIndexSelectedData from '@hooks/useIndexSelectedData'
import useShuffledData from '@hooks/useShuffledData'
import { AnimatePresence, motion } from 'motion/react'
import useStreak from '@hooks/useStreak'
import { saveSession, loadSession, clearSession, saveScore } from '@lib/storage'
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
  title: string
  rawData: Question[]
  dataClass: ClassString
  reversed?: boolean
}

export default function CardClient({ slug, title: _title, rawData, dataClass, reversed = false }: Props) {
  const displayData = reversed
    ? rawData.map((q) => ({ ...q, question: q.answer, answer: q.question }))
    : rawData
  const [resumeSession] = useState(() => loadSession(slug))
  const [showResume, setShowResume] = useState(resumeSession !== null)
  const [incorrectAnswers, setIncorrectAnswers] = useState<Question[]>([])
  const [correctAnswers, setCorrectAnswers] = useState<Question[]>([])
  const [streak, setStreak, maxStreak, resetStreak] = useStreak()
  const [showHints, setShowHints] = useState<boolean | null>(null)
  const { data, isShuffled, reshuffle } = useShuffledData(displayData)
  const {
    selectedItem,
    selectedIndex,
    nextItem,
    prevItem,
    resetIndex,
    amountOfItems,
    progress: { isDone },
  } = useIndexSelectedData(data)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = localStorage.getItem('card-hints-dismissed')
    setShowHints(!dismissed)
  }, [])

  const handleResume = () => {
    if (!resumeSession) return
    const correct = displayData.filter((q) => resumeSession.correctIds.includes(q.id))
    const incorrect = displayData.filter((q) => resumeSession.incorrectIds.includes(q.id))
    setCorrectAnswers(correct)
    setIncorrectAnswers(incorrect)
    for (let i = 0; i < resumeSession.currentIndex; i++) {
      nextItem()
    }
    setShowResume(false)
  }

  const handleStartFresh = () => {
    clearSession(slug)
    setShowResume(false)
  }

  const onAnswer = (rightAnswer: boolean, data: Question) => {
    const newCorrectIds = rightAnswer
      ? [...correctAnswers.map((q) => q.id), data.id]
      : correctAnswers.map((q) => q.id)
    const newIncorrectIds = !rightAnswer
      ? [...incorrectAnswers.map((q) => q.id), data.id]
      : incorrectAnswers.map((q) => q.id)
    const nextIndex = selectedIndex + 1
    if (nextIndex >= amountOfItems) {
      clearSession(slug)
      const correctCount = rightAnswer ? correctAnswers.length + 1 : correctAnswers.length
      saveScore(slug, { score: Math.round((correctCount / rawData.length) * 100), total: rawData.length, mode: 'cards' })
    } else {
      saveSession(slug, {
        currentIndex: nextIndex,
        shuffleOrder: [],
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
    nextItem()
  }

  const handleUndo = () => {
    if (selectedIndex === 0) return

    const lastCorrect = correctAnswers[correctAnswers.length - 1]
    const lastIncorrect = incorrectAnswers[incorrectAnswers.length - 1]

    if (lastCorrect && correctAnswers.length > 0) {
      setCorrectAnswers((prev) => prev.slice(0, -1))
      setStreak((c) => c - 1)
    } else if (lastIncorrect && incorrectAnswers.length > 0) {
      setIncorrectAnswers((prev) => prev.slice(0, -1))
      setStreak(0)
    }

    prevItem()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showHints) {
        setShowHints(false)
        localStorage.setItem('card-hints-dismissed', 'true')
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        handleUndo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, correctAnswers, incorrectAnswers, showHints])

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

  if (!rawData || !isShuffled || selectedItem == null) return null
  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <AnimatePresence>
        {showResume && resumeSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg-300/90 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-bg-400 border border-bg-600 rounded-xl p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
              <p className="text-text font-semibold text-lg">Resume session?</p>
              <p className="text-text-muted text-sm">
                You left off at card {resumeSession.currentIndex + 1} of {rawData.length}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleResume}
                  className="flex-1 px-4 py-2 rounded-lg bg-accent-blue text-bg-300 font-medium hover:opacity-90 transition-opacity"
                >
                  Resume
                </button>
                <button
                  onClick={handleStartFresh}
                  className="flex-1 px-4 py-2 rounded-lg border border-bg-600 text-text-muted hover:text-text hover:border-text-muted transition-colors"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {!isDone ? (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <ProgressBar currentAmount={selectedIndex} maxAmount={amountOfItems} streak={streak} />
              {selectedIndex > 0 && (
                <button
                  onClick={handleUndo}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-1 rounded border border-text-secondary hover:border-text-primary"
                >
                  ↶ Undo
                </button>
              )}
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
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="fixed bottom-0 left-0 right-0 bg-bg-500 border-t border-bg-600 px-4 py-3 pointer-events-none"
          >
            <div className="max-w-4xl mx-auto flex flex-wrap gap-4 justify-center text-xs">
              <Shortcut keys={['Enter', 'Space']} action="flip" />
              <Shortcut keys={['Enter']} action="correct" />
              <Shortcut keys={['Backspace']} action="wrong" />
              <Shortcut keys={['Esc']} action="unflip" />
              <Shortcut keys={['⌘Z', 'Ctrl+Z']} action="undo" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
