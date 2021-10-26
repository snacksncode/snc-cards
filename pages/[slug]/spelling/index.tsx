import React, { ChangeEventHandler, KeyboardEventHandler, RefObject, useRef } from "react"; // useState, // useEffect, // RefObject, // KeyboardEventHandler, // FormEventHandler, // createRef, // ChangeEventHandler,
import shoetest from "shoetest";
import styles from "@styles/Spelling.module.scss";
import classNames from "classnames";
import { GetStaticPropsContext } from "next";
import Viewer from "@components/Viewer";
import { motion } from "framer-motion";

// interface CharInputData {
//   value: string;
//   ref: RefObject<HTMLInputElement>;
//   correct: null | boolean;
// }
// type CharInputObject = { [key: string]: CharInputData };

interface Props {
  data: QuestionData[] | null;
}

const SpellInput: React.FC<{
  index: number;
  value: string;
  isCorrect: boolean;
  onKeyDown: KeyboardEventHandler<HTMLInputElement>;
  onChange: ChangeEventHandler<HTMLInputElement>;
  ref: RefObject<HTMLInputElement>;
}> = ({ value, index, isCorrect, onChange, onKeyDown, ref }) => {
  const classes = classNames(styles.char, {
    //charInputData[globalCharIndex].correct
    [`${styles["char--correct"]}`]: isCorrect === true,
    [`${styles["char--wrong"]}`]: isCorrect === false,
  });
  return (
    <motion.input
      key={`char_input_${index}`}
      type="text"
      className={classes}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * (index + 1) } }}
      autoCapitalize="none"
      value={value}
      ref={ref}
      onKeyDown={onKeyDown}
      onChange={onChange}
      name={index.toString()}
    />
  );
};

const Spelling: React.FC<{
  data: QuestionData;
  onAnswer: (rightAnswer: boolean, data: QuestionData) => void;
}> = ({ data, onAnswer }) => {
  const { answer } = data;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {(shoetest.simplify(answer) as string).split(" ").map((word, wordIndex) => {
        return (
          <div className={styles.word} key={`word_${wordIndex}`}>
            {word.split("").map((_c, _cI) => {
              return <SpellInput />;
            })}
          </div>
        );
      })}

      <button onClick={() => onAnswer(true, data)}>Correct</button>
      <button onClick={() => onAnswer(false, data)}>Wrong</button>
    </motion.div>
  );
};

export default function CardId({ data }: Props) {
  let globalCharIndex = useRef(-1);
  if (!data) return <div>Building...</div>;
  return <Viewer Component={Spelling} rawData={data} {...globalCharIndex} />;
}
// const [shuffledData, setShuffledData] = useState(data);
// const [currentWordIndex, setCurrentWordIndex] = useState(0);
// const selectedQuestion = shuffledData?.[currentWordIndex];
// const [charInputData, setCharInputData] = useState<CharInputObject | null>(null);
// const [doneParsing, setDoneParsing] = useState(false);

// const getCharArray = (word: string): string[] => {
//   return word.split("").filter((c) => c !== " ");
// };

// // ignore the first render, then fill in charInputData
// useEffect(() => {
//   if (selectedQuestion == null) return;
//   const generatedCharData: CharInputObject = {};

//   getCharArray(shoetest.simplify(selectedQuestion.fields.answer)).map((_char, charIdx) => {
//     const genObj: CharInputData = { ref: createRef(), value: "", correct: null };
//     generatedCharData[charIdx] = genObj;
//   });

//   setDoneParsing(true);
//   setCharInputData(generatedCharData);
// }, [selectedQuestion]);

// const checkAnswer: FormEventHandler = (e) => {
//   e.preventDefault();
//   if (selectedQuestion == null || charInputData == null) return;
//   getCharArray(shoetest.simplify(selectedQuestion.fields.answer.toLowerCase())).map((correctChar, correctCharIdx) => {
//     const verdict = charInputData[correctCharIdx].value.toLowerCase() === correctChar;
//     const inputState = charInputData[correctCharIdx];
//     inputState.correct = verdict;
//     setCharInputData((oldState) => {
//       return {
//         ...oldState,
//         [correctCharIdx]: inputState,
//       };
//     });
//   });
// };

// const nextWord = () => {
//   setDoneParsing(false);
//   setCurrentWordIndex((i) => i + 1);
// };

// const handleCharInputKeypress: KeyboardEventHandler<HTMLInputElement> = (e) => {
//   const key = e.key;
//   console.log(key);
//   const target = e.target as HTMLInputElement;
//   const targetIndex = Number(target.name);
//   if (key === "Backspace" && e.ctrlKey) {
//     clearAllInputs();
//   }
//   if (key === "ArrowLeft") {
//     focusPrevInput(targetIndex, false);
//   }
//   if (key === "ArrowRight") {
//     focusNextInput(targetIndex);
//   }
//   if (key === "Backspace" && target.value.length === 0) {
//     focusPrevInput(targetIndex);
//   }
// };

// const removeVerdictFromAllInputs = () => {
//   if (charInputData == null) return;
//   const charInputDataCopy = Object.assign({}, charInputData);
//   for (const charInput of Object.values(charInputDataCopy)) {
//     charInput.correct = null;
//   }
//   setCharInputData(charInputDataCopy);
// };

// const clearAllInputs = () => {
//   if (charInputData == null) return;
//   const charInputDataCopy = Object.assign({}, charInputData);
//   for (const charInput of Object.values(charInputDataCopy)) {
//     charInput.value = "";
//   }
//   setCharInputData(charInputDataCopy);
//   // push onto the next event loop
//   setTimeout(() => {
//     charInputData[0].ref.current?.focus();
//   });
// };

// const focusNextInput = (index: number) => {
//   if (charInputData == null) return;
//   const nextInputToFocus = charInputData[index + 1];
//   if (!nextInputToFocus) return;
//   nextInputToFocus.ref.current?.focus();
// };

// const focusPrevInput = (index: number, shouldClear = true) => {
//   if (charInputData == null) return;
//   const prevInputToFocus = charInputData[index - 1];
//   if (!prevInputToFocus) return;
//   prevInputToFocus.ref.current?.focus();
//   if (shouldClear) charInputData[index - 1].value = "";
// };

// const handleCharInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
//   e.target.focus();
//   if (charInputData == null) return;
//   removeVerdictFromAllInputs();
//   const inputIndex = Number(e.target.name);
//   const inputState = charInputData[inputIndex];
//   inputState.value = e.target.value.replace(charInputData[inputIndex].value, "").slice(-1); // accent only the last char
//   setCharInputData((oldState) => {
//     return {
//       ...oldState,
//       [inputIndex]: inputState,
//     };
//   });
//   if (e.target.value.length !== 0) focusNextInput(inputIndex);
// };

// if (!data) return <div>Building...</div>;
// // safety checks for TypeScript
// if (selectedQuestion == null || doneParsing !== true || charInputData == null) return null;
// const { answer, question } = selectedQuestion.fields;
// return (
//   <div className={styles.container}>
//     <div className={styles.card}>
//       <h1 className={styles.title}>{question}</h1>
//       <form onSubmit={checkAnswer}>
//         <button style={{ display: "none" }} type="submit">
//           Submit
//         </button>
//       </form>
//     </div>
//     <button onClick={nextWord}>Go next</button>
//   </div>
// );
// }

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  const apiData = await fetch(`${apiUrl}/entries?slug=${params?.slug}`);
  let dataArray: APIData[] = await apiData.json();

  if (!dataArray.length) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const rawData = dataArray[0];
  return {
    props: {
      data: rawData.questionData,
    },
    revalidate: 60,
  };
};

export async function getStaticPaths() {
  const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  const rawData = await fetch(`${apiUrl}/entries`);
  let data: APIData[] = await rawData.json();

  const paths = data.map((d) => {
    return {
      params: { slug: d.slug },
    };
  });

  return { paths, fallback: true };
}
