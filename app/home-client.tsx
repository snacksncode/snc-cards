'use client'

import { ChangeEventHandler, useDeferredValue, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@components/Button'
import { Collapsible } from '@base-ui/react/collapsible'
import Filter from '@components/Filter'
import ListEntries from '@components/ListEntries'
import { populateAllFakeData, clearAllData } from '@lib/storage'
import HowItWorksInteractive from '@components/HowItWorksInteractive'
import { Sparkles } from 'lucide-react'
import type { Topic } from '@/types'

interface Props {
  topics: Topic[]
}

export default function HomeClient({ topics }: Props) {
  const [inputValue, setInputValue] = useState('')
  const filterString = useDeferredValue(inputValue)
  const [demoState, setDemoState] = useState<'loading' | 'available' | 'loaded'>('loading')
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputValue(e.target.value)
  }

  useEffect(() => {
    setDemoState(localStorage.getItem('demo-loaded') === 'true' ? 'loaded' : 'available')
  }, [])

  return (
    <main className="relative px-8 py-8 mx-auto w-full max-w-200 flex flex-col">
      <div
        className="pointer-events-none absolute left-0 -top-8 w-87.5 h-62.5 rounded-full"
        style={{
          background: "radial-gradient(ellipse at 20% 50%, var(--color-accent-gold), transparent 70%)",
          filter: "blur(72px)",
          opacity: 0.07,
          zIndex: -1,
        }}
        aria-hidden="true"
      />
      <h1 className="mt-0 mb-8 text-[clamp(1.75rem,6vw,3rem)] font-serif font-bold">
        What would you like to learn?
      </h1>
      <section className="overflow-hidden mb-6">
        <Collapsible.Root open={howItWorksOpen} onOpenChange={setHowItWorksOpen}>
          <div className="bg-bg-400 rounded-lg border border-bg-600">
            <Collapsible.Trigger className="w-full flex items-center justify-between p-4 cursor-pointer bg-transparent border-none focus-visible:outline-2 focus-visible:outline-offset-[-2px]">
              <h2 className="text-sm font-semibold tracking-widest uppercase text-text-muted m-0">
                How It Works
              </h2>
              <motion.svg
                aria-hidden="true"
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
              keepMounted
              render={(props, state) => {
                const { hidden, ...rest } = props
                return (
                  <motion.div
                    {...(rest as React.ComponentProps<typeof motion.div>)}
                    initial={false}
                    animate={{
                      height: state.open ? 'auto' : 0,
                      opacity: state.open ? 1 : 0,
                    }}
                    transition={{
                      duration: state.open ? 0.4 : 0.3,
                      ease: [0.66, 0, 0.34, 1],
                    }}
                    style={{ ...rest.style, overflow: 'hidden' }}
                  />
                )
              }}
            >
              <div inert={!howItWorksOpen || undefined}>
                <HowItWorksInteractive open={howItWorksOpen} onComplete={() => setHowItWorksOpen(false)} />
              </div>
            </Collapsible.Panel>
          </div>
        </Collapsible.Root>
      </section>
      <Filter value={inputValue} onChangeHandler={handleInputChange} />
      <ListEntries filterString={filterString} data={topics} />

      {/* Demo data FAB */}
      <AnimatePresence mode="wait">
        {demoState === 'available' && (
          <motion.div
            key="load-demo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-4 z-50 group"
          >
            <Button
              variant="subtle"
              accent="var(--color-accent-gold)"
              onClick={async () => {
                await populateAllFakeData(topics)
                localStorage.setItem('demo-loaded', 'true')
                setDemoState('loaded')
              }}
            >
              <Sparkles size={16} aria-hidden="true" /> Try demo data
            </Button>
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-bg-500 border border-bg-600 rounded-lg text-xs text-text-muted whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              See score history and all features in action
            </div>
          </motion.div>
        )}
        {demoState === 'loaded' && (
          <motion.div
            key="clear-demo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-4 z-50 group"
          >
            <Button
              variant="subtle"
              accent="var(--color-accent-red)"
              onClick={async () => {
                await clearAllData()
                localStorage.removeItem('demo-loaded')
                setDemoState('available')
              }}
            >
              Clear demo data
            </Button>
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-bg-500 border border-bg-600 rounded-lg text-xs text-text-muted whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Remove all score history and sessions
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
