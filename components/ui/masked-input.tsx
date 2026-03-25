'use client'

import { IMaskInput } from 'react-imask'
import {
  forwardRef,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type CSSProperties,
} from 'react'

interface MaskedInputProps {
  mask: (RegExp | string)[]
  placeholderChar?: string
  showMask?: boolean
  guide?: boolean
  autoFocus?: boolean
  className?: string
  style?: CSSProperties
  'data-id'?: string
  'aria-label'?: string
  autoComplete?: string
  spellCheck?: boolean
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
}

function buildIMaskPattern(mask: (RegExp | string)[]) {
  const KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let keyIdx = 0
  let pattern = ''
  const definitions: Record<string, RegExp> = {}
  const literalChars = new Set<string>()

  for (const part of mask) {
    if (typeof part === 'string') literalChars.add(part)
  }

  for (const part of mask) {
    if (typeof part === 'string') {
      pattern += `\\${part}`
    } else {
      let key = KEYS[keyIdx % KEYS.length]
      while (literalChars.has(key)) {
        keyIdx++
        key = KEYS[keyIdx % KEYS.length]
      }
      definitions[key] = part
      pattern += key
      keyIdx++
    }
  }

  return { pattern, definitions }
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    {
      mask,
      placeholderChar = '_',
      autoFocus = false,
      className,
      style,
      'data-id': dataId,
      'aria-label': ariaLabel,
      autoComplete,
      spellCheck,
      onChange,
      onFocus,
      onKeyDown,
    },
    forwardedRef
  ) => {
    const { pattern, definitions } = buildIMaskPattern(mask)

    return (
      <IMaskInput
        mask={pattern}
        definitions={definitions}
        lazy={false}
        placeholderChar={placeholderChar}
        autoFocus={autoFocus}
        className={className}
        style={style}
        data-id={dataId}
        aria-label={ariaLabel}
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        inputRef={(el: HTMLInputElement | null) => {
          if (typeof forwardedRef === 'function') {
            forwardedRef(el)
          } else if (forwardedRef) {
            forwardedRef.current = el
          }
        }}
        onInput={(e: React.FormEvent<HTMLInputElement>) => {
          if (onChange) onChange(e as unknown as ChangeEvent<HTMLInputElement>)
        }}
        onFocus={onFocus as React.FocusEventHandler<HTMLInputElement>}
        onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLInputElement>}
      />
    )
  }
)

MaskedInput.displayName = 'MaskedInput'

export { MaskedInput }
export default MaskedInput
