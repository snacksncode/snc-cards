import React, {
  ChangeEventHandler,
  createRef,
  FormEventHandler,
  KeyboardEventHandler,
  RefObject,
  useEffect,
  useState,
} from "react";
import shoetest from "shoetest";
import { getData } from "@data/exporter";
import styles from "@styles/Spelling.module.scss";
import shuffle from "utils/shuffle";
import classNames from "classnames";
import { motion } from "framer-motion";
interface Props {
  data: WordData[];
}

interface CharInputData {
  value: string;
  ref: RefObject<HTMLInputElement>;
  correct: null | boolean;
}
type CharInputObject = { [key: string]: CharInputData };

export default function CardId({ data }: Props) {
  const [shuffledData, setShuffledData] = useState<WordData[] | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const selectedWord = shuffledData?.[currentWordIndex];
  const [charInputData, setCharInputData] = useState<CharInputObject | null>(null);
  const [doneParsing, setDoneParsing] = useState(false);
  let globalCharIndex = -1;

  const getCharArray = (word: string): string[] => {
    return word.split("").filter((c) => c !== " ");
  };

  // shuffle data upon first render
  useEffect(() => {
    setShuffledData(shuffle(data));
  }, [data]);

  // ignore the first render, then fill in charInputData
  useEffect(() => {
    if (selectedWord == null) return;
    const generatedCharData: CharInputObject = {};

    getCharArray(shoetest.simplify(selectedWord.answer)).map((_char, charIdx) => {
      const genObj: CharInputData = { ref: createRef(), value: "", correct: null };
      generatedCharData[charIdx] = genObj;
    });
    console.log(`[Generation]: Created object with ${Object.values(generatedCharData).length} items`);

    setDoneParsing(true);
    setCharInputData(generatedCharData);
  }, [selectedWord]);

  const checkAnswer: FormEventHandler = (e) => {
    e.preventDefault();
    if (selectedWord == null || charInputData == null) return;
    getCharArray(shoetest.simplify(selectedWord.answer.toLowerCase())).map((correctChar, correctCharIdx) => {
      const verdict = charInputData[correctCharIdx].value.toLowerCase() === correctChar;
      const inputState = charInputData[correctCharIdx];
      inputState.correct = verdict;
      setCharInputData((oldState) => {
        return {
          ...oldState,
          [correctCharIdx]: inputState,
        };
      });
    });
  };

  const nextWord = () => {
    setDoneParsing(false);
    setCurrentWordIndex((i) => i + 1);
  };

  const handleCharInputKeypress: KeyboardEventHandler<HTMLInputElement> = (e) => {
    const key = e.key;
    console.log(key);
    const target = e.target as HTMLInputElement;
    const targetIndex = Number(target.name);
    if (key === "Backspace" && e.ctrlKey) {
      clearAllInputs();
    }
    if (key === "ArrowLeft") {
      focusPrevInput(targetIndex, false);
    }
    if (key === "ArrowRight") {
      focusNextInput(targetIndex);
    }
    if (key === "Backspace" && target.value.length === 0) {
      focusPrevInput(targetIndex);
    }
  };

  const removeVerdictFromAllInputs = () => {
    if (charInputData == null) return;
    const charInputDataCopy = Object.assign({}, charInputData);
    for (const charInput of Object.values(charInputDataCopy)) {
      charInput.correct = null;
    }
    setCharInputData(charInputDataCopy);
  };

  const clearAllInputs = () => {
    if (charInputData == null) return;
    const charInputDataCopy = Object.assign({}, charInputData);
    for (const charInput of Object.values(charInputDataCopy)) {
      charInput.value = "";
    }
    setCharInputData(charInputDataCopy);
    // push onto the next event loop
    setTimeout(() => {
      charInputData[0].ref.current?.focus();
    });
  };

  const focusNextInput = (index: number) => {
    if (charInputData == null) return;
    const nextInputToFocus = charInputData[index + 1];
    if (!nextInputToFocus) return;
    nextInputToFocus.ref.current?.focus();
  };

  const focusPrevInput = (index: number, shouldClear = true) => {
    if (charInputData == null) return;
    const prevInputToFocus = charInputData[index - 1];
    if (!prevInputToFocus) return;
    prevInputToFocus.ref.current?.focus();
    if (shouldClear) charInputData[index - 1].value = "";
  };

  const handleCharInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.target.focus();
    if (charInputData == null) return;
    removeVerdictFromAllInputs();
    const inputIndex = Number(e.target.name);
    const inputState = charInputData[inputIndex];
    inputState.value = e.target.value.replace(charInputData[inputIndex].value, "").slice(-1); // accent only the last char
    setCharInputData((oldState) => {
      return {
        ...oldState,
        [inputIndex]: inputState,
      };
    });
    if (e.target.value.length !== 0) focusNextInput(inputIndex);
  };

  // safety checks for TypeScript
  if (selectedWord == null || charInputData == null || doneParsing !== true) return null;
  console.log(`[Data]: `, charInputData);
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Question: {selectedWord.question}</h1>
        <form onSubmit={checkAnswer}>
          {(shoetest.simplify(selectedWord.answer) as string).split(" ").map((word, wordIndex) => {
            return (
              <div className={styles.word} key={`word_${wordIndex}`}>
                {word.split("").map((_c, _cI) => {
                  globalCharIndex++;
                  const classes = classNames(styles.char, {
                    [`${styles["char--correct"]}`]: charInputData[globalCharIndex].correct === true,
                    [`${styles["char--wrong"]}`]: charInputData[globalCharIndex].correct === false,
                  });
                  return (
                    <motion.input
                      key={`char_input_${globalCharIndex}`}
                      type="text"
                      className={classes}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * (globalCharIndex + 1) } }}
                      autoCapitalize="none"
                      value={charInputData?.[globalCharIndex].value}
                      ref={charInputData?.[globalCharIndex].ref}
                      onKeyDown={handleCharInputKeypress}
                      onChange={handleCharInputChange}
                      name={globalCharIndex.toString()}
                    />
                  );
                })}
              </div>
            );
          })}
          <button style={{ display: "none" }} type="submit">
            Submit
          </button>
        </form>
      </div>
      <button onClick={nextWord}>Go next</button>
    </div>
  );
}

export async function getStaticPaths() {
  const paths = (await getData()).map((d) => ({
    params: { id: d.id },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: any) {
  const data = (await getData()).find((d) => d.id === params.id)?.data;
  return {
    props: { data: data },
  };
}
