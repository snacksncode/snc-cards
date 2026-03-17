'use client'

import { ChangeEventHandler, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Category, Edit, NoteText } from '@components/icons'
import Filter from '@components/Filter'
import ListEntries from '@components/ListEntries'
import type { Topic } from '@/types'

interface Props {
  topics: Topic[]
}

export default function HomeClient({ topics }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [filterString, setFilterString] = useState<string | null>(null)
  const [tutorialDismissed, setTutorialDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('tutorial-dismissed') === 'true'
  })

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputValue(e.target.value)
  }

  useEffect(() => {
    const TIMEOUT_MS = inputValue.length === 0 ? 0 : 400
    const timeoutId = window.setTimeout(() => {
      setFilterString(inputValue)
    }, TIMEOUT_MS)
    return () => clearTimeout(timeoutId)
  }, [inputValue])

  const dismissTutorial = () => {
    localStorage.setItem('tutorial-dismissed', 'true')
    setTutorialDismissed(true)
  }

  return (
    <main className="px-8 py-8 mx-auto w-full max-w-[800px] flex flex-col">
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mt-0 mb-8 text-[clamp(1.5rem,8vw,2.5rem)] font-bold"
      >
        Select one of the topics below
      </motion.h1>
      <AnimatePresence>
        {!tutorialDismissed && (
          <motion.section
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{
              opacity: 1,
              height: 'auto',
              marginBottom: 24,
              transition: { delay: 0.05, duration: 0.4, ease: 'easeOut' },
            }}
            exit={{
              opacity: 0,
              height: 0,
              marginBottom: 0,
              transition: { duration: 0.3, ease: 'easeIn' },
            }}
            className="overflow-hidden"
          >
            <div className="bg-bg-400 rounded-lg p-6 border border-bg-600">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold tracking-widest uppercase text-text-muted m-0">
                  How It Works
                </h2>
                <button
                  onClick={dismissTutorial}
                  className="text-text-muted hover:text-text text-xs font-medium px-3 py-1.5 rounded bg-bg-500 hover:bg-bg-600 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-bg-500 rounded p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-accent-blue font-bold text-sm">
                    <Category size={18} color="currentColor" />
                    Cards
                  </div>
                  <p className="text-text-muted text-xs leading-relaxed m-0">
                    See a question, answer in your head, then flip the card. Mark
                    correct with{' '}
                    <kbd className="bg-bg-300 px-1 rounded text-text font-mono">
                      Enter
                    </kbd>{' '}
                    or wrong with{' '}
                    <kbd className="bg-bg-300 px-1 rounded text-text font-mono">
                      Backspace
                    </kbd>{' '}
                    — tracks your streak.
                  </p>
                </div>
                <div className="bg-bg-500 rounded p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-accent-green font-bold text-sm">
                    <Edit size={18} color="currentColor" />
                    Spelling
                  </div>
                  <p className="text-text-muted text-xs leading-relaxed m-0">
                    Type the answer letter by letter into masked inputs, then
                    submit to check. Diacritics are simplified —{' '}
                    <span className="text-text font-mono text-[0.65rem]">
                      Straße = Strasse
                    </span>
                    .
                  </p>
                </div>
                <div className="bg-bg-500 rounded p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-accent-peachy font-bold text-sm">
                    <NoteText size={18} color="currentColor" />
                    List
                  </div>
                  <p className="text-text-muted text-xs leading-relaxed m-0">
                    Browse all Q&A pairs side by side. Shows a duplicate warning
                    if the dataset contains repeated questions.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      <Filter value={inputValue} onChangeHandler={handleInputChange} />
      <ListEntries filterString={filterString} data={topics} />
    </main>
  )
}
