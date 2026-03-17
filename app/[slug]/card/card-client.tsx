'use client'

import { useState } from 'react'
import FlipCard from '@components/FlipCard'
import EndCard from '@components/EndCard'
import ProgressBar from '@components/ProgressBar'
import useIndexSelectedData from '@hooks/useIndexSelectedData'
import useShuffledData from '@hooks/useShuffledData'
import { AnimatePresence, motion } from 'motion/react'
import useStreak from '@hooks/useStreak'
import type { ClassString, Question } from '@/types'

interface Props {
  title: string
  rawData: Question[]
  dataClass: ClassString
}

export default function CardClient({ title: _title, rawData, dataClass }: Props) {
  const [incorrectAnswers, setIncorrectAnswers] = useState<Question[]>([])
  const [correctAnswers, setCorrectAnswers] = useState<Question[]>([])
  const [streak, setStreak, maxStreak, resetStreak] = useStreak()
  const { data, isShuffled, reshuffle } = useShuffledData(rawData)
  const {
    selectedItem,
    selectedIndex,
    nextItem,
    resetIndex,
    amountOfItems,
    progress: { isDone },
  } = useIndexSelectedData(data)

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
            <ProgressBar currentAmount={selectedIndex} maxAmount={amountOfItems} streak={streak} />
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
    </div>
  )
}
