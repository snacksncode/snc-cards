import { FC, useState, useRef, FocusEventHandler } from "react"
import { AnimatePresence, motion } from "motion/react"
import { removeDiacritics, getCardDimensions } from "@lib/utils"
import useWindowSize from "@hooks/useWindowSize"
import { useMeasure } from "@hooks/useMeasure"
import MaskedInput from "@components/ui/masked-input"
import { ArrowRight, Information } from "@components/icons"
import { cn } from "@lib/cn"
import { Button } from "@components/Button"
import Watermark from "@components/Watermark"
import ExpandingBlob from "@components/ExpandingBlob"
import type { Question } from "@/types"

interface Props {
  data: Question
  onAnswer: (answeredRight: boolean, input: string, expected: string, data: Question) => void
  onWrongAnswer?: () => void
}

interface InputProps {
  value: string
  expectedValue: string
  isCorrect: boolean | null
}

type InputData = Record<string, InputProps>

const SEPARATOR = "/"

const card = {
  out: { opacity: 0, x: "50%", y: "-50%", scale: 0.25 },
  in: { opacity: 1, x: "-50%", y: "-50%", scale: 1, transition: { type: "spring" as const, stiffness: 120, damping: 20 } },
  outExit: { opacity: 0, x: "-150%", scale: 0.25, transition: { type: "spring" as const, stiffness: 120, damping: 20 } },
}

const getCleanedValue = (value: string): string => {
  return value
    .split("")
    .filter((c) => /[a-z]/i.test(c) || /\d/.test(c))
    .join("")
}

const WordInput: FC<{
  isCorrect: boolean | null
  mask: (RegExp | string)[]
  onChangeCallback: (value: string, id: string) => void
  onFocusCallback: FocusEventHandler<HTMLInputElement>
  id: string
  autoFocus?: boolean
  maskPlaceholder?: string
  "aria-label"?: string
}> = ({ id, mask, isCorrect, onChangeCallback, onFocusCallback, autoFocus = false, maskPlaceholder = "_", "aria-label": ariaLabel }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const inputIsEmpty = useRef(true)

  const classes = cn(
    "bg-bg-300 border-none text-text font-semibold py-[0.35em] px-[0.5em] text-center isolate tracking-[1px] rounded transition-[box-shadow] duration-200 shadow-[0_3px_0_var(--color-bg-400),0_3px_8px_rgba(0,0,0,0.25)] focus-visible:outline-none",
    {
      "focus-visible:shadow-[0_3px_0_var(--color-accent-blue),0_3px_8px_rgba(0,0,0,0.25)] focus-visible:-translate-y-[3px]":
        isCorrect === null,
      "shadow-[0_3px_0_var(--color-accent-green),0_3px_8px_rgba(0,0,0,0.25)]": isCorrect === true,
      "shadow-[0_3px_0_var(--color-accent-red),0_3px_8px_rgba(0,0,0,0.25)]": isCorrect === false,
    }
  )

  return (
    <MaskedInput
      ref={inputRef}
      mask={mask}
      placeholderChar={maskPlaceholder}
      showMask={true}
      className={classes}
      style={{
        width: `calc(${mask.length}ch + 1.8em + ${mask.filter((e) => !(e instanceof RegExp)).length} * 0.5ch)`,
      }}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      autoComplete="off"
      spellCheck={false}
      data-id={id}
      onKeyDown={(e) => {
        if (!(e.target instanceof HTMLInputElement)) return
        const targetInput = e.target
        const key = e.key
        const cleanValue = getCleanedValue(e.target.value)
        if (key === "Backspace" && inputIsEmpty.current) {
          const form = targetInput.closest("form")
          const inputs = form ? Array.from(form.querySelectorAll<HTMLInputElement>("input[data-id]")) : []
          const idx = inputs.indexOf(targetInput)
          if (idx > 0) inputs[idx - 1].focus()
        }
        inputIsEmpty.current = cleanValue.length === 0
      }}
      onFocus={(e) => {
        if (inputIsEmpty.current) setTimeout(() => e.target.setSelectionRange(0, 0), 0)
        onFocusCallback(e)
      }}
      onChange={(e) => {
        if (isCorrect != null) return
        const value = e.target.value
        const cleanValue = getCleanedValue(value)
        inputIsEmpty.current = cleanValue.length === 0
        onChangeCallback(value, id)
      }}
    />
  )
}

const splitInput = (input: string) => {
  return removeDiacritics(input)
    .split(/\s/)
    .filter((i) => i.length !== 0)
}

const generateMask = (word: string) => {
  const maskArray: (RegExp | string)[] = []
  word.split("").forEach((char) => {
    if (/[a-z]/i.test(char)) {
      maskArray.push(/[a-z]/i)
    } else if (/\d/.test(char)) {
      maskArray.push(/\d/)
    } else {
      maskArray.push(char)
    }
  })
  return maskArray
}

const generateInputData = (answer: string): [InputData, string[]] => {
  const inputArray = splitInput(answer)
  const generatedData: InputData = {}
  const idsInOrder: string[] = []
  inputArray.forEach((word, wordIdx) => {
    if (word === SEPARATOR) return
    const id = `${word}_${wordIdx}`
    idsInOrder.push(id)
    const data: InputProps = {
      value: "",
      expectedValue: word,
      isCorrect: null,
    }
    generatedData[id] = data
  })

  return [generatedData, idsInOrder]
}

const SpellingByWord: FC<Props> = ({ data, onAnswer, onWrongAnswer }) => {
  const answer = data.answer
  const inputArray = splitInput(answer)
  const { width } = useWindowSize()
  const { cardWidth } = getCardDimensions(data.question, answer, width)

  const [hasFinishedEntering, setHasFinishedEntering] = useState(false)
  const [shouldAnimateBlob, setShouldAnimateBlob] = useState(false)

  const [answered, setAnswered] = useState<[boolean, string] | null>(null)
  const currentlyFocusedInput = useRef<HTMLInputElement | null>(null)
  const [shouldShowCorrectAnswer, setShouldShowCorrectAnswer] = useState(false)

  const [infoRef, { height: infoHeight }] = useMeasure<HTMLDivElement>()

  const inputIdsInOrder = useRef<string[] | null>(null)
  const [inputData, setInputData] = useState<InputData | null>(() => {
    const [generatedData, idsInOrder] = generateInputData(answer)
    inputIdsInOrder.current = idsInOrder
    return generatedData
  })

  const doCheckAnswer = () => {
    if (hasFinishedEntering === false || inputIdsInOrder.current == null || inputData == null) return

    // Second press after wrong answer — continue to blob
    if (shouldShowCorrectAnswer === true) {
      setShouldAnimateBlob(true)
      return
    }

    let verdict = true
    const userInput: string[] = []
    const inputDataClone = { ...inputData }
    inputIdsInOrder.current.forEach((id) => {
      const input = inputDataClone[id]
      const inputVerdict = getCleanedValue(input.value).toLowerCase() === input.expectedValue.toLowerCase()
      if (inputVerdict === false) verdict = false
      userInput.push(input.value)
      inputDataClone[id] = { ...input, isCorrect: inputVerdict }
    })
    setInputData(inputDataClone)

    const userInputStr = userInput.join(" ")
    setTimeout(() => {
      setAnswered([verdict, userInputStr])
      if (verdict) {
        setShouldAnimateBlob(true)
      } else {
        setShouldShowCorrectAnswer(true)
        onWrongAnswer?.()
      }
    }, 100)
  }

  const onChangeHandler = (value: string, id: string) => {
    if (inputData == null) return
    const input = inputData[id]
    const cleanValue = getCleanedValue(value)
    // auto-advance to next input when word is fully filled
    if (cleanValue.length === getCleanedValue(input.expectedValue).length) {
      const currentInput = currentlyFocusedInput.current
      if (currentInput) {
        const form = currentInput.closest("form")
        const inputs = form ? Array.from(form.querySelectorAll<HTMLInputElement>("input[data-id]")) : []
        const idx = inputs.indexOf(currentInput)
        if (idx >= 0 && idx + 1 < inputs.length) inputs[idx + 1].focus()
      }
    }
    setInputData((oldState) => {
      return {
        ...oldState,
        [id]: { ...oldState![id], value: value },
      }
    })
  }

  const onFocusHandler: FocusEventHandler<HTMLInputElement> = (e) => {
    currentlyFocusedInput.current = e.target
  }

  const containerClasses = cn(
    "rounded-[5px] overflow-hidden text-accent-blue font-bold text-[1.25rem] border-2 border-accent-blue min-h-[225px] relative isolate bg-bg-400 text-center flex flex-col items-center justify-center p-[1em] transition-colors duration-[350ms]",
    "@min-[450px]:text-[2.25rem] @min-[450px]:p-[1.5em]",
    {
      "border-accent-green": shouldAnimateBlob && answered != null && answered[0] === true,
      "border-accent-red": shouldAnimateBlob && answered != null && answered[0] === false,
    }
  )

  if (!inputData) return null

  return (
    <motion.div
      variants={card}
      initial="out"
      animate="in"
      exit="outExit"
      onAnimationComplete={() => {
        if (!hasFinishedEntering) setHasFinishedEntering(true)
      }}
      className="absolute top-1/2 left-1/2"
      style={{ width: cardWidth }}
    >
      <motion.div className={containerClasses}>
        <Watermark size="md" text="spelling" />
        <motion.div
          initial={false}
          animate={{ y: shouldShowCorrectAnswer ? 0 : infoHeight / 2 }}
          transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
        >
          <p className="m-0 mb-6 text-inherit">{data.question}</p>
          <form
            onSubmit={(e) => { e.preventDefault(); doCheckAnswer(); }}
            className="flex flex-wrap items-center relative justify-center gap-3 font-mono text-[1.125rem]"
          >
            {inputArray.map((word, wordIdx) => {
              if (word === SEPARATOR) {
                return (
                  <span
                    key={`sep_${wordIdx}`}
                    className="text-text-muted font-bold select-none px-1"
                  >
                    /
                  </span>
                )
              }
              const mask = generateMask(word)
              const id = `${word}_${wordIdx}`
              const inputProps = inputData[id]
              const isFirstInput = inputIdsInOrder.current?.[0] === id
              const inputIndex = inputIdsInOrder.current?.indexOf(id) ?? 0
              const props = {
                id: id,
                mask: mask,
                isCorrect: inputProps.isCorrect,
                maskPlaceholder: "_",
                autoFocus: isFirstInput,
                "aria-label": `Enter word ${inputIndex + 1}`,
                onFocusCallback: onFocusHandler,
                onChangeCallback: onChangeHandler,
              }
              return <WordInput key={id} {...props} />
            })}
            <input className="hidden" type="submit" />
          </form>
        </motion.div>
        <motion.div
          ref={infoRef}
          className="text-[0.9rem] font-medium inline-flex items-center justify-center text-text gap-[0.35rem] pt-5 @min-[450px]:text-[1.25rem]"
          initial={false}
          animate={{ opacity: shouldShowCorrectAnswer ? 1 : 0, y: shouldShowCorrectAnswer ? 0 : 6 }}
          transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
          aria-hidden={!shouldShowCorrectAnswer}
        >
          <Information aria-hidden="true" size="1.25em" className="text-accent-blue" />
          {answer}
        </motion.div>

        {answered != null && shouldAnimateBlob && (
          <ExpandingBlob
            type={answered[0] === true ? "correct" : "wrong"}
            onAnimationComplete={() => {
              onAnswer(answered[0], answered[1], inputArray.join(" "), { ...data, answer })
            }}
          />
        )}
      </motion.div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{
          scale: shouldAnimateBlob ? 0 : 1,
          transition: { delay: shouldAnimateBlob ? 0 : 0.5 },
        }}
        className="absolute left-1/2 -translate-x-1/2 top-full mt-6 flex justify-center w-full -z-10"
      >
        <AnimatePresence mode="wait">
          {shouldShowCorrectAnswer ? (
            <motion.div
              key="continue"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                accent="var(--color-accent-green)"
                onClick={() => doCheckAnswer()}
              >
                Continue
                <ArrowRight aria-hidden="true" size={24} />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="check"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                accent="var(--color-accent-blue)"
                onClick={() => doCheckAnswer()}
              >
                Check
                <ArrowRight aria-hidden="true" size={24} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default SpellingByWord
