import { useState, useCallback } from "react"

export function useMeasure<T extends HTMLElement = HTMLElement>() {
  const [rect, setRect] = useState({ width: 0, height: 0 })

  const ref = useCallback((node: T | null) => {
    if (!node) return
    const ro = new ResizeObserver(([entry]) => {
      const { inlineSize: width, blockSize: height } = entry.borderBoxSize[0]
      setRect({ width, height })
    })
    ro.observe(node)
    return () => ro.disconnect()
  }, [])

  return [ref, rect] as const
}
