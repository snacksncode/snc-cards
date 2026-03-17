"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import useShuffledData from "@/hooks/useShuffledData"
import useIndexSelectedData from "@/hooks/useIndexSelectedData"
import useStreak from "@/hooks/useStreak"
import EndCard from "@/components/EndCard"
import ProgressBar from "@/components/ProgressBar"
import SpellingByWord from "@/components/SpellingByWord"
import type { ClassString, Question, SpellingData } from "@/types"

interface Props {
  title: string
  rawData: Question[]
  dataClass: ClassString
}

const getKeyFromQuestion = (d: Question) => {
  return `${d.id}_${d.question}_${d.answer}`
}

export default function SpellingClient({ title: _title, rawData, dataClass }: Props) {
  const { data, isShuffled, reshuffle } = useShuffledData(rawData)
  const { selectedItem, selectedIndex, nextItem, resetIndex, progress, amountOfItems } = useIndexSelectedData(data)
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
