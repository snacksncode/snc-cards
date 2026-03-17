import { FC, useState, useEffect, FormEventHandler, useRef, FocusEventHandler } from "react"
import { AnimatePresence, motion } from "motion/react"
import { removeDiacritics } from "@lib/utils"
import MaskedInput from "@components/ui/masked-input"
import { ArrowRight, Information } from "@components/icons"
import { cn } from "@lib/cn"
import Watermark from "@components/Watermark"
import ExpandingBlob from "@components/ExpandingBlob"

interface Props {
  data: Question
  onAnswer: (answeredRight: boolean, input: string, expected: string, data: Question) => void
}

interface InputProps {
  value: string
  expectedValue: string
  isCorrect: boolean | null
}

type InputData = Record<string, InputProps>

const FIXES_TABLE = [{ from: /\s\/\s/g, to: "/" }]

const applyFixesTable = (word: string): string => {
  for (const fix of FIXES_TABLE) {
    word = word.replaceAll(fix.from, fix.to)
  }
  return word
}

const card = {
  out: { opacity: 0, x: "50%", y: "-50%", scale: 0.25 },
  in: { opacity: 1, x: "-50%", scale: 1, transition: { type: "spring", damping: 12 } },
  outExit: { opacity: 0, x: "-150%", scale: 0.25, transition: { type: "spring", damping: 12 } },
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
}> = ({ id, mask, isCorrect, onChangeCallback, onFocusCallback, autoFocus = false, maskPlaceholder = "_" }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const inputIsEmpty = useRef(true)

  const classes = cn(
    "bg-bg-300 border-none text-text font-semibold py-[0.35em] px-[0.5em] text-center isolate tracking-[1px] rounded transition-[transform,box-shadow] duration-200 shadow-[0_3px_0_var(--color-bg-400),0_3px_8px_rgba(0,0,0,0.25)] focus-visible:outline-none",
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
      data-id={id}
      onKeyDown={(e) => {
        if (!(e.target instanceof HTMLInputElement)) return
        const targetInput = e.target
        const key = e.key
        const cleanValue = getCleanedValue(e.target.value)
        if (key === "Backspace" && inputIsEmpty.current) {
          const prevInput = targetInput.previousElementSibling
          if (prevInput instanceof HTMLInputElement) prevInput.focus()
        }
        inputIsEmpty.current = cleanValue.length === 0
      }}
      onFocus={(e) => {
        if (inputIsEmpty.current) e.target.setSelectionRange(0, 0)
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

const SpellingByWord: FC<Props> = ({ data, onAnswer }) => {
  const answer = applyFixesTable(data.answer)
  const inputArray = splitInput(answer)

  const [hasFinishedEntering, setHasFinishedEntering] = useState(false)
  const [shouldAnimateBlob, setShouldAnimateBlob] = useState(false)

  const [answered, setAnswered] = useState<[boolean, string] | null>(null)
  const currentlyFocusedInput = useRef<HTMLInputElement | null>(null)
  const [shouldShowCorrectAnswer, setShouldShowCorrectAnswer] = useState(false)

  const inputIdsInOrder = useRef<string[]>()
  const [inputData, setInputData] = useState<InputData | null>(null)

  // trigger blob animation on answer which itself triggers onAnswer in parent component
  useEffect(() => {
    if (answered == null || hasFinishedEntering === false) return
    if (answered[0] === false) {
      setShouldShowCorrectAnswer(true)
      return
    }
    setShouldAnimateBlob(true)
  }, [answered, hasFinishedEntering, shouldShowCorrectAnswer])

  useEffect(() => {
    if (inputData != null) return
    const [generatedData, idsInOrder] = generateInputData(answer)
    setInputData(generatedData)
    inputIdsInOrder.current = idsInOrder
  }, [answer, inputData])

  const checkAnswer: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    if (hasFinishedEntering === false || inputIdsInOrder.current == null || inputData == null) return
    if (shouldShowCorrectAnswer === true) {
      setShouldAnimateBlob(true)
    }

    let verdict = true
    const userInput: string[] = []
    const inputDataClone = Object.assign({}, inputData)
    inputIdsInOrder.current.forEach((id, idIndex) => {
      const input = inputDataClone[id]
      const correspondingWord = inputArray[idIndex]
      const inputVerdict = input.value.toLowerCase() === correspondingWord.toLowerCase()
      if (inputVerdict === false) verdict = false
      userInput.push(input.value)
      input.isCorrect = inputVerdict
    })
    setInputData(inputDataClone)
    setTimeout(() => setAnswered([verdict, userInput.join(" ")]), 100)
  }

  const onChangeHandler = (value: string, id: string) => {
    if (inputData == null) return
    const input = inputData[id]
    const cleanValue = getCleanedValue(value)
    // auto-advance to next input when word is fully filled
    if (cleanValue.length === getCleanedValue(input.expectedValue).length) {
      const currentInput = currentlyFocusedInput.current
      const nextInput = currentInput?.nextElementSibling
      if (nextInput instanceof HTMLInputElement) nextInput.focus()
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
    "rounded-[5px] overflow-hidden text-accent-blue font-bold text-[1.25rem] border-2 border-accent-blue min-h-[175px] relative isolate bg-bg-400 text-center flex flex-col items-center justify-center p-[1em] transition-colors duration-[350ms]",
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
      className="fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-[600px]"
    >
      <motion.div className={containerClasses}>
        <p className="m-0 mb-6 text-inherit">{data.question}</p>
        <Watermark size="md" text="spelling" />
        <form
          onSubmit={checkAnswer}
          className="flex flex-wrap items-center relative justify-center gap-3 font-mono text-[1.125rem]"
        >
          {inputArray.map((word, wordIdx) => {
            const mask = generateMask(word)
            const id = `${word}_${wordIdx}`
            const inputProps = inputData[id]
            const props = {
              id: id,
              mask: mask,
              isCorrect: inputProps.isCorrect,
              maskPlaceholder: "_",
              autoFocus: wordIdx === 0,
              onFocusCallback: onFocusHandler,
              onChangeCallback: onChangeHandler,
            }
            return <WordInput key={id} {...props} />
          })}
          <input className="hidden" type="submit" />
        </form>
        <AnimatePresence>
          {shouldShowCorrectAnswer && (
            <motion.div
              className="text-[0.9rem] font-medium inline-flex items-center justify-center text-text gap-[0.35rem] mt-5 @min-[450px]:text-[1.25rem]"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <Information size="1.25em" className="text-accent-blue" />
              {answer}
            </motion.div>
          )}
        </AnimatePresence>

        {answered != null && shouldAnimateBlob && (
          <ExpandingBlob
            type={answered[0] === true ? "correct" : "wrong"}
            onAnimationComplete={() => {
              onAnswer(answered[0], answered[1], inputArray.join(" "), { ...data, answer })
            }}
          />
        )}
      </motion.div>
      <motion.button
        initial={{ x: "-50%", y: -100, scale: 0 }}
        animate={{
          y: shouldAnimateBlob ? -100 : 0,
          scale: shouldAnimateBlob ? 0 : 1,
          transition: { delay: shouldAnimateBlob ? 0 : 0.5 },
        }}
        whileTap={{ scale: 0.95, transition: { delay: 0 } }}
        onClick={checkAnswer as any}
        className={cn(
          "absolute isolate bottom-[-3.5rem] -z-10 left-1/2 bg-transparent text-accent-blue cursor-pointer border-none inline-flex py-[0.4em] px-[1.25em] text-[0.9rem] font-bold items-center rounded-[4px] justify-center transition-colors duration-200",
          "hover:text-white focus-visible:text-white",
          "focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-accent-blue focus-visible:outline-offset-[0.5rem]",
          "after:content-[''] after:rounded-[inherit] after:absolute after:inset-0 after:scale-50 after:opacity-0 after:bg-accent-blue after:-z-10",
          "after:transition-[transform,opacity] after:duration-300 after:[transition-timing-function:cubic-bezier(0.83,0,0.17,1)]",
          "hover:after:scale-100 hover:after:opacity-100 focus-visible:after:scale-100 focus-visible:after:opacity-100"
        )}
      >
        Submit
        <ArrowRight size={24} className="ml-[0.5em]" />
      </motion.button>
    </motion.div>
  )
}

export default SpellingByWord
