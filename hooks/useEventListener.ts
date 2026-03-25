import { useEffect, useRef } from 'react'

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: EventTarget
) {
  const savedHandler = useRef(handler)
  
  savedHandler.current = handler

  useEffect(() => {
    const target = element ?? window
    if (!target?.addEventListener) return
    
    const eventListener = (event: Event) => savedHandler.current(event as WindowEventMap[K])
    target.addEventListener(eventName, eventListener)
    return () => target.removeEventListener(eventName, eventListener)
  }, [eventName, element])
}
