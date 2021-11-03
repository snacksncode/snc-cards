import {
  FC,
  useState,
  createRef,
  useCallback,
  useMemo,
  FormEventHandler,
  KeyboardEventHandler,
  ChangeEventHandler,
  RefObject,
  useEffect,
  useRef,
} from "react";
import { motion } from "framer-motion";
import shoetest from "shoetest";
import styles from "./Spelling.module.scss";
import SpellingInput from "@components/SpellingInput";

interface InputData {
  value: string;
  selfRef: RefObject<HTMLInputElement>;
  prevRef: RefObject<HTMLInputElement> | null;
  nextRef: RefObject<HTMLInputElement> | null;
  validity: {
    expected: string;
    isSpecial: boolean;
    isCorrect: boolean | null;
    isDetermined: boolean;
    isPreviewed: boolean;
  };
}

interface ParsedAnswer {
  words: {
    word: string;
    chars: string[];
  }[];
}

interface Props {
  data: QuestionData;
  onAnswer: (answeredRight: boolean, data: QuestionData) => void;
}

const Spelling: FC<Props> = ({ data, onAnswer }) => {
  const orderedInputIds = useRef<string[]>();
  const firstRender = useRef(true);
  const { answer, question } = data;

  const getInputId = (word: string, char: string, charIdx: number) => `${word}_${char}_${charIdx}`;
  const isSpecial = (char: string) => !/^\w$/.test(char);

  const generateInputData = useCallback((parsed: ParsedAnswer) => {
    const genRecord: Record<string, InputData> = {};
    // used to build node-like struct to allow for easier focus management
    let prevNonSpecialInputId: string | null = null;
    let orderedIds: string[] = [];
    parsed.words.forEach((wordData) => {
      wordData.chars.forEach((char, charIdx) => {
        const id = getInputId(wordData.word, char, charIdx);
        const isSpecialChar = isSpecial(char);
        if (!isSpecialChar) orderedIds.push(id);
        const inputData: InputData = {
          value: "",
          selfRef: createRef(),
          nextRef: null,
          prevRef: null,
          validity: {
            expected: char,
            isSpecial: isSpecialChar,
            isCorrect: null,
            isDetermined: false,
            isPreviewed: false,
          },
        };
        genRecord[id] = inputData;
        if (prevNonSpecialInputId != null) {
          const prevInput = genRecord[prevNonSpecialInputId];
          prevInput.nextRef = inputData.selfRef;
          inputData.prevRef = prevInput.selfRef;
        }
        if (!isSpecialChar) prevNonSpecialInputId = id;
      });
    });
    orderedInputIds.current = orderedIds;
    return genRecord;
  }, []);

  const removeDiacritics = (string: string | undefined): string => {
    return shoetest.simplify(string);
  };

  const parseAnswer = useCallback((input: string) => {
    const output: ParsedAnswer = { words: [] };
    const normalizedInput = removeDiacritics(input);
    const words = normalizedInput.split(" ");
    words.forEach((word) => {
      const chars = word.split("");
      output.words.push({ word, chars });
    });
    return output;
  }, []);

  const parsed = useMemo(() => parseAnswer(answer), [answer, parseAnswer]);
  const generatedInputData = useMemo(() => generateInputData(parsed), [parsed, generateInputData]);
  const [dataRecord, setDataRecord] = useState(generatedInputData);

  const checkAnswer: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const incorrectChars: { char: string; index: number }[] = [];
    const localDataRecord = Object.assign({}, dataRecord);
    let charIndex = 0;
    parsed.words.forEach((w) => {
      const { word, chars } = w;
      chars.forEach((char, charIdx) => {
        if (isSpecial(char)) return;
        const correspondingInputId = getInputId(word, char, charIdx);
        const inputData = Object.assign({}, getInput(correspondingInputId));
        const value = inputData.value;
        const isCorrect = value === char && inputData.validity.isPreviewed !== true;
        inputData.validity.isCorrect = isCorrect;
        inputData.validity.isDetermined = true;
        if (value.length === 0) {
          inputData.validity.isPreviewed = true;
          inputData.value = char;
        }
        if (!isCorrect) incorrectChars.push({ char, index: charIndex });
        localDataRecord[correspondingInputId] = inputData;
        charIndex++;
      });
    });
    setDataRecord(localDataRecord);

    // auto-answering
    // TODO: Convert to useEffect and useState (maybe)
    let answeredRight = incorrectChars.length <= 0;
    setTimeout(
      () => {
        onAnswer(answeredRight, data);
      },
      answeredRight ? 150 : 500
    );
  };

  const focusNextInput = (inputId: string) => {
    const currentlyFocusedInput = getInput(inputId);
    const nextInput = currentlyFocusedInput.nextRef;
    if (!nextInput) return;
    nextInput.current?.focus();
  };

  const focusPrevInput = (inputId: string) => {
    const currentlyFocusedInput = getInput(inputId);
    const prevInput = currentlyFocusedInput.prevRef;
    if (!prevInput) return;
    prevInput.current?.focus();
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    const key = e.key;
    const target = e.target as HTMLInputElement;
    const id = target.dataset.id;
    if (id == null) return;
    if (getInput(id).validity.isDetermined === true) removeVerdictFromAllInputs();
    if (key === "ArrowLeft") {
      focusPrevInput(id);
    }
    if (key === "ArrowRight") {
      focusNextInput(id);
    }
    if (key === "Backspace") {
      if (target.value.length === 0) focusPrevInput(id);
      if (target.value.length > 0) clearInput(id);
      if (e.ctrlKey) clearAll();
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const inputId = e.target.dataset.id;
    if (inputId == null) throw new Error("[onChange] Input doesn't contain id");
    const inputState = getInput(inputId);
    if (inputState == null) throw new Error(`[onChange] Data with supplied id (${inputId}) not found in Record`);
    const newState = Object.assign({}, inputState);
    let value = e.target.value;
    if (value === "" || !/^[a-zA-Z]$/.test(value)) return;
    newState.value = value;
    updateInput(inputId, newState);
    if (value.length !== 0) focusNextInput(inputId);
  };

  const removeVerdictFromAllInputs = () => {
    if (orderedInputIds.current == null) return;
    orderedInputIds.current.forEach((id) => {
      const data = getInput(id);
      if (data.validity.isPreviewed === true) data.value = "";
      data.validity = {
        expected: data.validity.expected,
        isCorrect: null,
        isSpecial: isSpecial(data.validity.expected),
        isDetermined: false,
        isPreviewed: false,
      };
      updateInput(id, data);
    });
  };

  const updateInput = (inputId: string, data: InputData) => {
    setDataRecord((oldState) => {
      return {
        ...oldState,
        [inputId]: data,
      };
    });
  };

  const clearAll = () => {
    const allInputIds = Object.keys(dataRecord);
    allInputIds.forEach((id) => {
      clearInput(id);
    });
    const firstInput = getFirstInput();
    if (firstInput != null) firstInput.selfRef.current?.focus();
  };

  const getInput = useCallback((id: string) => dataRecord[id], [dataRecord]);

  const getFirstInput = useCallback(() => {
    if (orderedInputIds == null) return;
    const firstInputId = orderedInputIds.current?.[0];
    if (firstInputId == null) return;
    return getInput(firstInputId);
  }, [getInput]);

  const clearInput = (inputId: string) => {
    const inputData = getInput(inputId);
    inputData.value = "";
    updateInput(inputId, inputData);
  };

  useEffect(() => {
    if (firstRender.current === false) return;
    firstRender.current = false;
    if (orderedInputIds == null) return;
    const firstInput = getFirstInput();
    if (firstInput == null) return;
    firstInput.selfRef.current?.focus();
  }, [getFirstInput]);

  return (
    <motion.div
      initial={{ opacity: 0, x: "50%", y: "-50%" }}
      animate={{ opacity: 1, x: "-50%" }}
      exit={{ opacity: 0, x: "-150%" }}
      className={styles.inputContainer}
    >
      <h2>{question}</h2>
      <form onSubmit={checkAnswer}>
        {parsed.words.map((w, wordIdx) => {
          const { word, chars } = w;
          return (
            <span key={`${word}_${wordIdx}`} className={styles.word}>
              {chars.map((char, charIdx) => {
                const id = getInputId(word, char, charIdx);
                const data = getInput(id);
                if (data == null) return;
                const { validity, selfRef, value } = data;
                return (
                  <SpellingInput
                    validity={validity}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    refObject={selfRef}
                    value={value}
                    key={id}
                    id={id}
                  />
                );
              })}
            </span>
          );
        })}
        <br />
        <button style={{ marginTop: 20 }} type="submit">
          Submit
        </button>
      </form>
    </motion.div>
  );
};

export default Spelling;
