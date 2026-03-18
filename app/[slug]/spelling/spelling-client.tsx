"use client"

import { useState, useEffect, useRef } from "react"
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
  resume?: boolean
}

const getKeyFromQuestion = (d: Question) => {
  return `${d.id}_${d.question}_${d.answer}`
}

export default function SpellingClient({ slug, title: _title, rawData, dataClass, reversed = false, resume = false }: Props) {
  const displayData = reversed
    ? rawData.map((q) => ({ ...q, question: q.answer, answer: q.question }))
    : rawData
  const [isLoading, setIsLoading] = useState(true)
  const resumeApplied = useRef(false)
  const { data: shuffledData, isShuffled, reshuffle, setOrder } = useShuffledData(displayData)
  const { selectedItem, selectedIndex, nextItem, resetIndex, progress, amountOfItems, jumpToIndex } = useIndexSelectedData(shuffledData)

  useEffect(() => {
    const init = async () => {
      if (!resume) {
        await clearSession(slug)
      }
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
        jumpToIndex(session.currentIndex)
      }
      resumeApplied.current = true
    }
    applyResume()
  }, [isLoading, slug, resume, jumpToIndex, setOrder])
  const [incorrectAnswers, setIncorrectAnswers] = useState<SpellingData[]>([])
  const [correctAnswers, setCorrectAnswers] = useState<SpellingData[]>([])
  const [streak, setStreak, maxStreak, resetStreak] = useStreak()

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
      const isFullRun = amountOfItems === rawData.length
      if (isFullRun) {
        const correctCount = answeredRight ? correctAnswers.length + 1 : correctAnswers.length
        saveScore(slug, { score: Math.round((correctCount / rawData.length) * 100), total: rawData.length, mode: "spelling" })
      }
    } else {
      saveSession(slug, {
        currentIndex: nextIndex,
        shuffleOrder: shuffledData.map((q) => q.id),
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

  if (!rawData || !isShuffled || selectedItem == null || isLoading) return null
  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden">
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
