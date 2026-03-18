'use client'

import { ChangeEventHandler, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Category, Edit, NoteText } from '@components/icons'
import Filter from '@components/Filter'
import ListEntries from '@components/ListEntries'
import { populateAllFakeData, clearAllData } from '@lib/storage'
import type { Topic } from '@/types'

interface Props {
  topics: Topic[]
}

export default function HomeClient({ topics }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [filterString, setFilterString] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    setIsCollapsed(localStorage.getItem('snc-cards-tutorial-collapsed') === 'true')
  }, [])

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDebug) setShowDebug(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showDebug])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    localStorage.setItem('snc-cards-tutorial-collapsed', String(newState))
    setIsCollapsed(newState)
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
      <motion.section
        initial={{ opacity: 0, marginBottom: 0 }}
        animate={{
          opacity: 1,
          marginBottom: 24,
          transition: { delay: 0.05, duration: 0.4, ease: 'easeOut' },
        }}
        className="overflow-hidden"
      >
        <div className="bg-bg-400 rounded-lg border border-bg-600">
          <button
            onClick={toggleCollapse}
            className="w-full flex items-center justify-between p-4 cursor-pointer bg-transparent border-none"
          >
            <h2 className="text-sm font-semibold tracking-widest uppercase text-text-muted m-0">
              How It Works
            </h2>
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-text-muted"
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </button>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 pb-4">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
      <Filter value={inputValue} onChangeHandler={handleInputChange} />
      <ListEntries filterString={filterString} data={topics} />
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 left-4 z-40 w-10 h-10 rounded-full bg-bg-500 border border-bg-600 text-text-muted hover:text-text flex items-center justify-center cursor-pointer transition-colors"
        aria-label="Load demo data"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          <path d="M20 3v4" />
          <path d="M22 5h-4" />
          <path d="M4 17v2" />
          <path d="M5 18H3" />
        </svg>
      </button>
      <AnimatePresence>
        {showDebug && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowDebug(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-400 border border-bg-600 rounded-xl p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text m-0">Try It Out</h2>
                <button
                  onClick={() => setShowDebug(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-transparent border-none text-text-muted hover:text-text cursor-pointer transition-colors"
                  aria-label="Close"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-text-muted mb-4 m-0">
                This app works best with some data. Load demo data to see score history, resume
                sessions, and all other features in action.
              </p>
              <div className="flex flex-col gap-3">
                <button
                   onClick={async () => {
                     await populateAllFakeData(topics)
                     setShowDebug(false)
                   }}
                   className="w-full py-2.5 px-4 rounded-lg bg-accent-blue text-white font-semibold text-sm border-none cursor-pointer hover:brightness-110 transition-all"
                 >
                    Load Demo Data
                 </button>
                 <button
                   onClick={async () => {
                     await clearAllData()
                     setShowDebug(false)
                   }}
                   className="w-full py-2.5 px-4 rounded-lg bg-transparent border border-bg-600 text-accent-red font-semibold text-sm cursor-pointer hover:bg-bg-500 transition-all"
                 >
                    Reset Everything
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
