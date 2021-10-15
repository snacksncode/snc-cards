import React, { ChangeEventHandler, createRef, KeyboardEventHandler, RefObject, useEffect, useState } from "react";
import shoetest from "shoetest";
import { getData } from "@data/exporter";
import styles from "@styles/Spelling.module.scss";
import shuffle from "utils/shuffle";
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
  console.log("[ Re-render ]");
  const [shuffledData, setShuffledData] = useState<WordData[] | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const selectedWord = shuffledData?.[currentWordIndex];
  const [charInputData, setCharInputData] = useState<CharInputObject | null>(null);
  const [doneParsing, setDoneParsing] = useState(false);
  // shuffle data upon first render
  console.log("[ Selected Word ]", JSON.stringify(selectedWord));
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

  const checkAnswer = () => {
    if (selectedWord == null || charInputData == null) return;
    const correctAnswer = (shoetest.simplify(selectedWord.answer) as string).split("");
    correctAnswer.map((correctChar, correctCharIdx) => {
      const verdict = charInputData[correctCharIdx].value === correctChar;
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
    const target = e.target as HTMLInputElement;
    if (key === "Backspace" && target.value.length === 0) {
      focusPrevInput(Number(target.name));
    }
  };

  const focusNextInput = (index: number) => {
    console.log("Focus next with index: ", index);
    if (charInputData == null) return;
    const nextInputToFocus = charInputData[index + 1];
    if (!nextInputToFocus) return;
    if (nextInputToFocus.isSpace) {
      focusNextInput(index + 1);
      return;
    }
    nextInputToFocus.ref.current?.focus();
  };

  const focusPrevInput = (index: number) => {
    console.log("Focus prev with index: ", index);
    if (charInputData == null) return;
    const prevInputToFocus = charInputData[index - 1];
    if (!prevInputToFocus) return;
    if (prevInputToFocus.isSpace) {
      focusPrevInput(index - 1);
      return;
    }
    prevInputToFocus.ref.current?.focus();
    charInputData[index - 1].value = "";
  };

  const handleCharInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    console.log("Change fired on: ", e.target.name);
    e.target.focus();
    if (charInputData == null || e.target.value.length > 1) return;
    const inputIndex = Number(e.target.name);
    const inputState = charInputData[inputIndex];
    inputState.value = e.target.value;
    setCharInputData((oldState) => {
      return {
        ...oldState,
        [inputIndex]: inputState,
      };
    });
    if (e.target.value.length !== 0) focusNextInput(inputIndex);
  };

  // const handleCharacter: ChangeEventHandler<HTMLInputElement> = (e) => {
  //   const index = Number(e.target.name);
  //   const newCharObject = Object.assign({}, characterData[index]);
  //   newCharObject.data = e.target.value;
  //   setCharacterData((oldData) => {
  //     return [...oldData, newCharObject];
  //   });
  // };

  // const handleCharFocus: FocusEventHandler<HTMLInputElement> = (e) => {
  //   const index = Number(e.target.name);
  //   const newCharObject = Object.assign({}, characterData[index]);
  //   newCharObject.focused = true;
  //   setCharacterData((oldData) => {
  //     return [...oldData, newCharObject];
  //   });
  // };

  // safety checks for TypeScript
  if (selectedWord == null || charInputData == null || doneParsing !== true) return null;

  return (
    <div className={styles.container}>
      <h1>Question: {selectedWord.question}</h1>
      <form>
        {(shoetest.simplify(selectedWord.answer) as string).split("").map((char, charIndex) => {
          if (char === " ") {
            return (
              <div
                tabIndex={0}
                ref={charInputData?.[charIndex].ref}
                key={`space_${charIndex}`}
                className={styles.space}
              ></div>
            );
          }
          return (
            <input
              key={`char_input_${charIndex}`}
              type="text"
              onFocus={(e) => {
                console.log("Focused input: ", e.target.name);
              }}
              value={charInputData?.[charIndex].value}
              ref={charInputData?.[charIndex].ref}
              onKeyDownCapture={handleCharInputKeypress}
              onChange={handleCharInputChange}
              name={charIndex.toString()}
            />
          );
        })}
      </form>
      <button onClick={checkAnswer}>Check</button>
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
