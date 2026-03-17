'use client'

import { useMaskito } from '@maskito/react'
import type { MaskitoOptions } from '@maskito/core'
import {
  forwardRef,
  useMemo,
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
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    {
      mask,
      placeholderChar = '_',
      showMask = true,
      guide = true,
      autoFocus = false,
      className,
      style,
      'data-id': dataId,
      onChange,
      onFocus,
      onKeyDown,
    },
    forwardedRef
  ) => {
    const maskitoOptions = useMemo<MaskitoOptions>(() => ({ mask }), [mask])
    const maskitoRef = useMaskito({ options: maskitoOptions })

    const guidePlaceholder =
      showMask || guide
        ? mask
            .map((part) => (typeof part === 'string' ? part : placeholderChar))
            .join('')
        : undefined

    return (
      <input
        ref={(node) => {
          maskitoRef(node)
          if (typeof forwardedRef === 'function') {
            forwardedRef(node)
          } else if (forwardedRef) {
            forwardedRef.current = node
          }
        }}
        type="text"
        placeholder={guidePlaceholder}
        autoFocus={autoFocus}
        className={className}
        style={style}
        data-id={dataId}
        onChange={onChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      />
    )
  }
)

MaskedInput.displayName = 'MaskedInput'

export { MaskedInput }
export default MaskedInput
