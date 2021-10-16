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
interface Props {
  data: WordData[];
}

interface CharInputData {
  value: string;
  ref: RefObject<HTMLInputElement>;
  isSpace: boolean;
  correct: null | boolean;
}
type CharInputObject = { [key: string]: CharInputData };

export default function CardId({ data }: Props) {
  const [shuffledData, setShuffledData] = useState<WordData[] | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const selectedWord = shuffledData?.[currentWordIndex];
  const [charInputData, setCharInputData] = useState<CharInputObject | null>(null);
  const [doneParsing, setDoneParsing] = useState(false);

  // shuffle data upon first render
  useEffect(() => {
    setShuffledData(shuffle(data));
  }, [data]);

  // ignore the first render, then fill in charInputData
  useEffect(() => {
    if (selectedWord == null) return;
    const generatedCharData: CharInputObject = {};

    (shoetest.simplify(selectedWord.answer) as string).split("").map((char, charIdx) => {
      const genObj: CharInputData = { ref: createRef(), value: "", isSpace: char === " ", correct: null };
      generatedCharData[charIdx] = genObj;
    });

    setDoneParsing(true);
    setCharInputData(generatedCharData);
  }, [selectedWord]);

  const checkAnswer: FormEventHandler = (e) => {
    e.preventDefault();
    if (selectedWord == null || charInputData == null) return;
    const correctAnswer = (shoetest.simplify(selectedWord.answer.toLowerCase()) as string).split("");
    correctAnswer.map((correctChar, correctCharIdx) => {
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
    if (nextInputToFocus.isSpace) {
      focusNextInput(index + 1);
      return;
    }
    nextInputToFocus.ref.current?.focus();
  };

  const focusPrevInput = (index: number, shouldClear = true) => {
    if (charInputData == null) return;
    const prevInputToFocus = charInputData[index - 1];
    if (!prevInputToFocus) return;
    if (prevInputToFocus.isSpace) {
      focusPrevInput(index - 1);
      return;
    }
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

  return (
    <div className={styles.container}>
      <h1>Question: {selectedWord.question}</h1>
      <form onSubmit={checkAnswer}>
        {(shoetest.simplify(selectedWord.answer) as string).split("").map((char, charIndex) => {
          if (char === " ") {
            return (
              <div
                tabIndex={-1}
                ref={charInputData?.[charIndex].ref}
                key={`space_${charIndex}`}
                className={styles.space}
              ></div>
            );
          }
          const classes = classNames(styles.char, {
            [`${styles["char--correct"]}`]: charInputData[charIndex].correct === true,
            [`${styles["char--wrong"]}`]: charInputData[charIndex].correct === false,
          });
          return (
            <input
              key={`char_input_${charIndex}`}
              type="text"
              className={classes}
              value={charInputData?.[charIndex].value}
              ref={charInputData?.[charIndex].ref}
              onKeyDown={handleCharInputKeypress}
              onChange={handleCharInputChange}
              name={charIndex.toString()}
            />
          );
        })}
        <button style={{ display: "none" }} onClick={checkAnswer}>
          Check
        </button>
      </form>
      {/* {showResult && (
        <>
          <p>
            Answer: {selectedData.answer} | Your input: {input}
          </p>
          {verdict()}
          <br />
          </>
        )} */}
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
