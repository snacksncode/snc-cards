import { FC, useState, useEffect, FormEventHandler, useRef, FocusEventHandler } from "react";
import { AnimatePresence, motion } from "framer-motion";
import shoetest from "shoetest";
import styles from "./SpellingByWord.module.scss";
import Watermark from "@components/Watermark";
import ExpandingBlob from "@components/ExpandingBlob";
import classNames from "classnames";
import MaskedInput from "react-text-mask";
import { ArrowRight, Information } from "iconsax-react";

interface Props {
  data: QuestionData;
  onAnswer: (answeredRight: boolean, input: string, expected: string, data: QuestionData) => void;
}

interface InputProps {
  value: string;
  expectedValue: string;
  isCorrect: boolean | null;
}

type InputData = Record<string, InputProps>;

const FIXES_TABLE = [{ from: /\s\/\s/g, to: "/" }];

const applyFixesTable = (word: string): string => {
  for (const fix of FIXES_TABLE) {
    word = word.replaceAll(fix.from, fix.to);
  }
  return word;
};

const card = {
  out: { opacity: 0, x: "50%", y: "-50%", scale: 0.25 },
  in: { opacity: 1, x: "-50%", scale: 1, transition: { type: "spring", damping: 12 } },
  outExit: { opacity: 0, x: "-150%", scale: 0.25, transition: { type: "spring", damping: 12 } },
};

const WordInput: FC<{
  isCorrect: boolean | null;
  mask: (RegExp | string)[];
  onChangeCallback: (value: string, id: string) => void;
  onFocusCallback: FocusEventHandler<HTMLInputElement>;
  id: string;
  autoFocus?: boolean;
  maskPlaceholder?: string;
}> = ({ id, mask, isCorrect, onChangeCallback, onFocusCallback, autoFocus = false, maskPlaceholder = "_" }) => {
  const classes = classNames(styles.input, {
    [styles["input--incorrect"]]: isCorrect === false,
    [styles["input--correct"]]: isCorrect === true,
  });
  const inputIsEmpty = useRef(true);
  const passedInitialValue = useRef(false);
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    if (inputRef.current == null || passedInitialValue.current === true) return;
    onChangeCallback(inputRef.current.value, inputRef.current.dataset.id!);
    passedInitialValue.current = true;
  }, [autoFocus, onChangeCallback]);

  return (
    <MaskedInput
      mask={mask}
      showMask={true}
      className={classes}
      guide={true}
      autoFocus={autoFocus}
      placeholderChar={maskPlaceholder}
      style={{
        width: `calc(${mask.length}ch + 1.8em + ${mask.filter((e) => !(e instanceof RegExp)).length} * 0.5ch)`,
      }}
      render={(textMaskRef, props) => (
        <input
          {...props}
          ref={(node) => {
            if (node == null) return;
            textMaskRef(node); // Keep this so the component can still function
            inputRef.current = node; // Copy the ref for yourself
          }}
        />
      )}
      onKeyDown={(e) => {
        if (!(e.target instanceof HTMLInputElement)) return;
        const targetInput = e.target;
        const key = e.key;
        const cleanValue = getCleanedValue(e.target.value);
        if (key === "Backspace" && inputIsEmpty.current) {
          const prevInput = targetInput.previousElementSibling;
          if (prevInput instanceof HTMLInputElement) prevInput.focus();
        }
        inputIsEmpty.current = cleanValue.length === 0;
      }}
      onFocus={(e) => {
        if (inputIsEmpty.current) e.target.setSelectionRange(0, 0);
        onFocusCallback(e);
      }}
      onChange={(e) => {
        if (isCorrect != null) return;
        const input = e.target;
        const value = input.value;
        const cleanValue = getCleanedValue(value);
        inputIsEmpty.current = cleanValue.length === 0;
        onChangeCallback(value, id);
      }}
      data-id={id}
    />
  );
};

const removeDiacritics = (string: string): string => {
  return shoetest.simplify(string);
};

const splitInput = (input: string) => {
  return removeDiacritics(input)
    .split(/\s/)
    .filter((i) => i.length !== 0);
};

const generateMask = (word: string) => {
  const maskArray: (RegExp | string)[] = [];
  word.split("").forEach((char) => {
    // a letter
    if (/[a-z]/i.test(char)) {
      maskArray.push(/[a-z]/i);
    } else if (/\d/.test(char)) {
      maskArray.push(/\d/);
    } else {
      // some special character like e.x. "-" or "/"
      maskArray.push(char);
    }
  });
  return maskArray;
};

const getCleanedValue = (value: string): string => {
  return value
    .split("")
    .filter((c) => /[a-z]/i.test(c) || /\d/.test(c))
    .join("");
};

const generateInputData = (answer: string): [InputData, string[]] => {
  const inputArray = splitInput(answer);
  const generatedData: InputData = {};
  const idsInOrder: string[] = [];
  inputArray.forEach((word, wordIdx) => {
    const id = `${word}_${wordIdx}`;
    idsInOrder.push(id);
    const data: InputProps = {
      value: "",
      expectedValue: word,
      isCorrect: null,
    };
    generatedData[id] = data;
  });

  return [generatedData, idsInOrder];
};

const SpellingByWord: FC<Props> = ({ data, onAnswer }) => {
  const answer = applyFixesTable(data.answer);
  const inputArray = splitInput(answer);

  const [hasFinishedEntering, setHasFinishedEntering] = useState(false);
  const [shouldAnimateBlob, setShouldAnimateBlob] = useState(false);

  const [answered, setAnswered] = useState<[boolean, string] | null>(null);
  const currentlyFocusedInput = useRef<HTMLInputElement | null>(null);
  const [shouldShowCorrectAnswer, setShouldShowCorrectAnswer] = useState(false);

  const inputIdsInOrder = useRef<string[]>();
  const [inputData, setInputData] = useState<InputData | null>(null);

  // used to trigger blob animation on answer which itself triggers onAnswer in parent component
  useEffect(() => {
    if (answered == null || hasFinishedEntering === false) return;
    if (answered[0] === false) {
      setShouldShowCorrectAnswer(true);
      return;
    }
    setShouldAnimateBlob(true);
  }, [answered, hasFinishedEntering, shouldShowCorrectAnswer]);

  useEffect(() => {
    // if inputData is not null -> data is already generated
    if (inputData != null) return;
    const [generatedData, idsInOrder] = generateInputData(answer);
    setInputData(generatedData);
    inputIdsInOrder.current = idsInOrder;
  }, [answer, inputData]);

  const checkAnswer: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (hasFinishedEntering === false || inputIdsInOrder.current == null || inputData == null) return;
    if (shouldShowCorrectAnswer === true) {
      setShouldAnimateBlob(true);
    }

    let verdict = true;
    const userInput: string[] = [];
    const inputDataClone = Object.assign({}, inputData);
    inputIdsInOrder.current.forEach((id, idIndex) => {
      const input = inputDataClone[id];
      const correspondingWord = inputArray[idIndex];
      const inputVerdict = input.value.toLowerCase() === correspondingWord.toLowerCase();
      if (inputVerdict === false) verdict = false;
      userInput.push(input.value);
      input.isCorrect = inputVerdict;
    });
    setInputData(inputDataClone);
    setTimeout(() => setAnswered([verdict, userInput.join(" ")]), 100);
  };

  const onChangeHandler = (value: string, id: string) => {
    if (inputData == null) return;
    const input = inputData[id];
    const cleanValue = getCleanedValue(value);
    // detect when input is fully filled, then try to focus next one (if found)
    if (cleanValue.length === getCleanedValue(input.expectedValue).length) {
      const currentInput = currentlyFocusedInput.current;
      const nextInput = currentInput?.nextElementSibling;
      if (nextInput instanceof HTMLInputElement) nextInput.focus();
    }
    setInputData((oldState) => {
      return {
        ...oldState,
        [id]: { ...oldState![id], value: value },
      };
    });
  };

  const onFocusHander: FocusEventHandler<HTMLInputElement> = (e) => {
    // onChangeHandler(e.target.value, e.target.dataset.id!);
    currentlyFocusedInput.current = e.target;
  };

  const borderStyles = classNames({
    [`${styles["container--correct"]}`]: shouldAnimateBlob && answered != null && answered[0] === true,
    [`${styles["container--incorrect"]}`]: shouldAnimateBlob && answered != null && answered[0] === false,
  });

  // if (!inputData) return <p>Generating...</p>;
  if (!inputData) return null;

  return (
    <motion.div
      variants={card}
      initial="out"
      animate="in"
      exit="outExit"
      onAnimationComplete={() => {
        if (!hasFinishedEntering) setHasFinishedEntering(true);
      }}
      className={styles.wrapper}
    >
      <motion.div className={classNames(styles.container, borderStyles)}>
        <p className={styles.question}>{data.question}</p>
        <Watermark size="md" text="spelling" />
        <form onSubmit={checkAnswer}>
          {inputArray.map((word, wordIdx) => {
            const mask = generateMask(word);
            const id = `${word}_${wordIdx}`;
            const inputProps = inputData[id];
            const props = {
              id: id,
              mask: mask,
              isCorrect: inputProps.isCorrect,
              maskPlaceholder: "_",
              autoFocus: wordIdx === 0,
              onFocusCallback: onFocusHander,
              onChangeCallback: onChangeHandler,
            };
            return <WordInput key={id} {...props} />;
          })}
          <input className="hidden" type="submit" />
        </form>
        <AnimatePresence>
          {shouldShowCorrectAnswer && (
            <motion.div
              className={styles.answerPreview}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <Information size="1.25em" variant="Bold" color="currentColor" />
              {answer}
            </motion.div>
          )}
        </AnimatePresence>

        {answered != null && shouldAnimateBlob && (
          <ExpandingBlob
            type={answered[0] === true ? "correct" : "wrong"}
            onAnimationComplete={() => {
              onAnswer(answered[0], answered[1], inputArray.join(" "), { ...data, answer });
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
        className={styles.submit}
      >
        Submit
        <ArrowRight size="24" color="currentColor" variant="Outline" />
      </motion.button>
    </motion.div>
  );
};

export default SpellingByWord;
