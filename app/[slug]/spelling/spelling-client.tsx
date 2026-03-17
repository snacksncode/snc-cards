"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import useShuffledData from "@/hooks/useShuffledData"
import useIndexSelectedData from "@/hooks/useIndexSelectedData"
import useStreak from "@/hooks/useStreak"
import EndCard from "@/components/EndCard"
import ProgressBar from "@/components/ProgressBar"
import SpellingByWord from "@/components/SpellingByWord"
import { saveSession, loadSession, clearSession, saveScore } from "@lib/storage"
import type { ClassString, Question, SpellingData } from "@/types"

interface Props {
  slug: string
  title: string
  rawData: Question[]
  dataClass: ClassString
  reversed?: boolean
}

const getKeyFromQuestion = (d: Question) => {
  return `${d.id}_${d.question}_${d.answer}`
}

export default function SpellingClient({ slug, title: _title, rawData, dataClass, reversed = false }: Props) {
  const displayData = reversed
    ? rawData.map((q) => ({ ...q, question: q.answer, answer: q.question }))
    : rawData
  const [resumeSession] = useState(() => loadSession(slug))
  const [showResume, setShowResume] = useState(resumeSession !== null)
  const { data, isShuffled, reshuffle } = useShuffledData(displayData)
  const { selectedItem, selectedIndex, nextItem, resetIndex, progress, amountOfItems } = useIndexSelectedData(data)
  const [incorrectAnswers, setIncorrectAnswers] = useState<SpellingData[]>([])
  const [correctAnswers, setCorrectAnswers] = useState<SpellingData[]>([])
  const [streak, setStreak, maxStreak, resetStreak] = useStreak()

  const handleResume = () => {
    if (!resumeSession) return
    for (let i = 0; i < resumeSession.currentIndex; i++) {
      nextItem()
    }
    setShowResume(false)
  }

  const handleStartFresh = () => {
    clearSession(slug)
    setShowResume(false)
  }

  const onRestart = (newData: Question[] | null = null) => {
    resetIndex()
    setIncorrectAnswers([])
    setCorrectAnswers([])
    reshuffle(newData)
    resetStreak()
  }

  const onAnswer = (answeredRight: boolean, input: string, expected: string, data: Question) => {
    const nextIndex = selectedIndex + 1
    if (nextIndex >= amountOfItems) {
      clearSession(slug)
      const correctCount = answeredRight ? correctAnswers.length + 1 : correctAnswers.length
      saveScore(slug, { score: Math.round((correctCount / rawData.length) * 100), total: rawData.length, mode: "spelling" })
    } else {
      saveSession(slug, {
        currentIndex: nextIndex,
        shuffleOrder: [],
        correctIds: [],
        incorrectIds: [],
        mode: "spelling",
      })
    }
    const stateUpdater = answeredRight ? setCorrectAnswers : setIncorrectAnswers
    const answerData: SpellingData = {
      input,
      expected,
      data,
    }
    stateUpdater((prevState) => {
      return [...prevState, answerData]
    })
    if (answeredRight === true) {
      setStreak((c) => c + 1)
    }
    if (answeredRight === false) {
      setStreak(0)
    }
    nextItem()
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
        {!progress.isDone ? (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProgressBar currentAmount={selectedIndex} maxAmount={amountOfItems} streak={streak} />
            <AnimatePresence>
              <SpellingByWord
                data={selectedItem as Question}
                onAnswer={onAnswer}
                key={getKeyFromQuestion(selectedItem as Question)}
              />
            </AnimatePresence>
          </motion.div>
        ) : (
          <EndCard
            key="endcard"
            mode="spelling"
            dataClass={dataClass}
            data={{ incorrect: incorrectAnswers, correct: correctAnswers }}
            amount={rawData.length}
            onRestart={onRestart}
            streak={maxStreak}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
