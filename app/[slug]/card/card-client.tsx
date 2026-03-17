'use client'

import { useState, useEffect } from 'react'
import FlipCard from '@components/FlipCard'
import EndCard from '@components/EndCard'
import ProgressBar from '@components/ProgressBar'
import useIndexSelectedData from '@hooks/useIndexSelectedData'
import useShuffledData from '@hooks/useShuffledData'
import { AnimatePresence, motion } from 'motion/react'
import useStreak from '@hooks/useStreak'
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
  title: string
  rawData: Question[]
  dataClass: ClassString
}

export default function CardClient({ title: _title, rawData, dataClass }: Props) {
  const [incorrectAnswers, setIncorrectAnswers] = useState<Question[]>([])
  const [correctAnswers, setCorrectAnswers] = useState<Question[]>([])
  const [streak, setStreak, maxStreak, resetStreak] = useStreak()
  const [showHints, setShowHints] = useState<boolean | null>(null)
  const { data, isShuffled, reshuffle } = useShuffledData(rawData)
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

  const onAnswer = (rightAnswer: boolean, data: Question) => {
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
