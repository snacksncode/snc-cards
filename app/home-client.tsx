'use client'

import { ChangeEventHandler, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Collapsible } from '@base-ui/react/collapsible'
import { Button } from '@components/Button'
import Filter from '@components/Filter'
import ListEntries from '@components/ListEntries'
import { populateAllFakeData } from '@lib/storage'
import HowItWorks4 from '@components/HowItWorks4'
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
    const TIMEOUT_MS = inputValue.length === 0 ? 0 : 150
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
      <AnimatePresence>
        {mounted && !demoLoaded && (
          <motion.div
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex items-center flex-wrap pb-4">
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
              <span className="text-text-muted ml-3 text-sm">See score history and all features in action</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <section className="overflow-hidden mb-6">
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
              <HowItWorks4 open={howItWorksOpen} />
            </Collapsible.Panel>
          </div>
        </Collapsible.Root>
      </section>
      <Filter value={inputValue} onChangeHandler={handleInputChange} />
      <ListEntries filterString={filterString} data={topics} />
    </main>
  )
}
