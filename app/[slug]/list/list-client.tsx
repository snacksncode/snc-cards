'use client'

import { useEffect, useRef, useState } from 'react'
import { getAccentForClass, groupBy } from '@lib/utils'
import { Back, ArrowCircleDown2, ArrowCircleRight2, Danger } from '@components/icons'
import { motion } from 'motion/react'
import Link from 'next/link'
import type { Question, Topic } from '@/types'
import { cn } from '@lib/cn'

interface Props {
  topic: Topic
}

export default function ListClient({ topic }: Props) {
  const { questions, title, class: classString } = topic
  const headerRef = useRef<HTMLDivElement | null>(null)
  const [isSticky, setIsSticky] = useState(false)
  const [dupsData, setDupsData] = useState<Question[][]>()

  useEffect(() => {
    if (!questions) return
    const grouped = groupBy(questions, (q) => q.question)
    const values = Object.values(grouped)
    const dups = values.filter((v) => v.length > 1)
    if (dups.length > 0) setDupsData(dups)
  }, [questions])

  useEffect(() => {
    const cachedRef = headerRef.current
    if (cachedRef == null) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(entry.intersectionRatio < 1)
      },
      { threshold: [1], rootMargin: '0px 100% 0px 100%' }
    )
    observer.observe(cachedRef)
    return () => {
      observer.unobserve(cachedRef)
    }
  }, [])

  const accentStyle = { '--clr-accent': getAccentForClass(classString) } as React.CSSProperties

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto mt-8 w-[calc(100%-3rem)] max-w-[750px] grid"
        style={accentStyle}
      >
        <div>
          <Link href="/" className="px-4 py-2 rounded text-sm inline-flex items-center gap-2 bg-bg-400">
            <Back size={18} />
            Go Back
          </Link>
        </div>
        <h1 className="text-2xl sm:text-[2rem] font-medium mt-4">
          List view for <br />
          <span className="text-[1.35em] font-bold text-[var(--clr-accent)] sm:pr-[0.25em] sm:bg-bg-300 sm:relative">
            {title}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1, transition: { delay: 0.3 } }}
              className="hidden sm:block w-[750px] h-[3px] absolute origin-left top-1/2 left-0 bg-[var(--clr-accent)] -z-[2]"
            />
          </span>
        </h1>
      </motion.div>

      {dupsData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.3 } }}
          className="mx-auto mt-4 w-[calc(100%-3rem)] max-w-[750px] rounded p-4 mb-8 flex flex-col text-[var(--color-bg-300)] bg-accent-yellow"
        >
          <h1 className="text-2xl sm:text-[2rem] m-0 flex flex-col sm:flex-row items-start sm:items-center">
            <Danger size={32} className="w-12 h-12 sm:mr-3 mb-1 sm:mb-0 flex-shrink-0" />
            Duplicates found in this dataset
          </h1>
          <p>Please combine them into one for a better learning experience by using e.x. a comma</p>
          <h3 className="m-0 mb-2">List of duplicates</h3>
          <ol className="m-0 pl-4 font-medium">
            {dupsData.map((dup) => (
              <li key={dup[0].question}>{dup[0].question}</li>
            ))}
          </ol>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.3 } }}
        ref={headerRef}
        style={accentStyle}
        className={cn(
          'hidden sm:block sticky top-[-1px] pt-[1px] z-[2] bg-bg-300 relative isolate',
          "after:content-[''] after:absolute after:inset-0 after:z-[-1] after:shadow-[0_4px_10px_rgba(0,0,0,0.15)] after:transition-opacity after:duration-150",
          isSticky ? 'after:opacity-100' : 'after:opacity-0'
        )}
      >
        <div className="mx-auto w-[calc(100%-3rem)] max-w-[750px]">
          <header className="grid grid-cols-[1fr_60px_1fr] gap-8 text-2xl font-bold px-4">
            <p className="m-0">Question</p>
            <ArrowCircleRight2
              size={32}
              className={cn(
                'place-self-center text-[var(--clr-accent)] transition-opacity duration-150',
                isSticky ? 'opacity-100' : 'opacity-0'
              )}
            />
            <p className="m-0 text-right">Answer</p>
          </header>
        </div>
      </motion.div>

      <div className="mx-auto w-[calc(100%-3rem)] max-w-[750px] grid" style={accentStyle}>
        <div className="grid grid-cols-1 gap-4 my-4">
          {questions.map((d, index) => {
            const { answer, question } = d
            return (
              <motion.div
                key={`${question}-${answer}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.05 * index + 0.3 } }}
                className="p-4 shadow rounded bg-bg-400 grid grid-rows-[auto_40px_auto] sm:grid-rows-[auto] sm:grid-cols-[1fr_20px_1fr] gap-x-4"
              >
                <div className="text-center text-lg font-medium sm:text-left">{question}</div>
                <div className="hidden sm:block h-full w-[3px] rounded-[3px] bg-bg-500 place-self-center" />
                <ArrowCircleDown2
                  size={32}
                  className="w-6 h-6 place-self-center m-1 sm:hidden text-[var(--clr-accent)]"
                />
                <div className="text-center text-lg font-bold text-[var(--clr-accent)] sm:text-right">
                  <span>{answer}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </>
  )
}
