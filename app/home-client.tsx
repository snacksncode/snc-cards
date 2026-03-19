'use client'

import { ChangeEventHandler, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Collapsible } from '@base-ui/react/collapsible'
import { Category, Edit, NoteText } from '@components/icons'
import { Button } from '@components/Button'
import Filter from '@components/Filter'
import ListEntries from '@components/ListEntries'
import { populateAllFakeData } from '@lib/storage'
import type { Topic } from '@/types'

interface Props {
  topics: Topic[]
}

export default function HomeClient({ topics }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [filterString, setFilterString] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [demoLoaded, setDemoLoaded] = useState(false)
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)

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
    setMounted(true)
    if (localStorage.getItem('demo-loaded') === 'true') setDemoLoaded(true)
  }, [])

  return (
    <main className="relative px-8 py-8 mx-auto w-full max-w-[800px] flex flex-col">
      <div
        className="pointer-events-none absolute left-0 -top-8 w-[350px] h-[250px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at 20% 50%, var(--color-accent-gold), transparent 70%)",
          filter: "blur(72px)",
          opacity: 0.07,
          zIndex: -1,
        }}
        aria-hidden="true"
      />
      <motion.h1
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }}
        className="mt-0 mb-8 text-[clamp(1.75rem,6vw,3rem)] font-serif font-bold"
      >
        What would you like to learn?
      </motion.h1>
      <AnimatePresence>
        {mounted && !demoLoaded && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.3, ease: 'easeOut' } }}
            className="flex items-center gap-3 mb-6"
          >
            <Button
              variant="subtle"
              accent="var(--color-accent-gold)"
              onClick={async () => {
                await populateAllFakeData(topics)
                localStorage.setItem('demo-loaded', 'true')
                setDemoLoaded(true)
              }}
            >
              ✨ Try with demo data
            </Button>
            <span className="text-text-muted text-sm">See score history and all features in action</span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.section
        initial={{ opacity: 0, marginBottom: 0 }}
        animate={{
          opacity: 1,
          marginBottom: 24,
          transition: { delay: 0.3, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
        }}
        className="overflow-hidden"
      >
        <Collapsible.Root open={howItWorksOpen} onOpenChange={setHowItWorksOpen}>
          <div className="bg-bg-400 rounded-lg border border-bg-600">
            <Collapsible.Trigger className="w-full flex items-center justify-between p-4 cursor-pointer bg-transparent border-none">
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
                animate={{ rotate: howItWorksOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <polyline points="6 9 12 15 18 9" />
              </motion.svg>
            </Collapsible.Trigger>
            <Collapsible.Panel
              render={
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                />
              }
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
            </Collapsible.Panel>
          </div>
        </Collapsible.Root>
      </motion.section>
      <Filter value={inputValue} onChangeHandler={handleInputChange} />
      <ListEntries filterString={filterString} data={topics} />
    </main>
  )
}
