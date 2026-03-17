'use client'

import { ChangeEventHandler, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import Filter from '@components/Filter'
import ListEntries from '@components/ListEntries'
import type { Topic } from '@/types'

interface Props {
  topics: Topic[]
}

export default function HomeClient({ topics }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [filterString, setFilterString] = useState<string | null>(null)

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

  return (
    <main className="px-8 py-8 mx-auto w-full max-w-[800px] flex flex-col">
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mt-0 mb-8 text-[clamp(1.5rem,8vw,2.5rem)] font-bold"
      >
        Select one of the topics below
      </motion.h1>
      <Filter value={inputValue} onChangeHandler={handleInputChange} />
      <ListEntries filterString={filterString} data={topics} />
    </main>
  )
}
