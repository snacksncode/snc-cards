import styles from "./Viewer.module.scss";
import FlipCard from "@components/FlipCard";
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion } from "framer-motion";
import Play from "icons/Play";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import ArrowRightCircle from "icons/ArrowRightCircle";
import classNames from "classnames";
import List from "icons/List";

interface Props {
  data: QuestionData[];
  dataClass: ClassString;
  onRestart: Function;
}

const DataWrapper = ({ type, children }: PropsWithChildren<{ type: ClassString }>) => {
  if (type === "math") return <MathJaxContext config={{ options: { enableMenu: false } }}>{children}</MathJaxContext>;
  return <>{children}</>;
};

const FormatedData = ({ data, type }: { data: string; type: ClassString }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <div className={styles.answer}>
        {type !== "math" ? (
          <span>{data}</span>
        ) : (
          <>
            {!loaded && <span>Loading...</span>}
            <span style={{ display: loaded ? "block" : "none", fontSize: "1.5rem" }}>
              <MathJax onInitTypeset={() => setLoaded(true)}>{String.raw`${data}`}</MathJax>
            </span>
          </>
        )}
      </div>
    </>
  );
};

const Viewer = ({ data, dataClass, onRestart }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const percentageRef = useRef<HTMLParagraphElement>(null);
  const [isReviewOpened, setIsReviewOpened] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState<QuestionData[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<QuestionData[]>([]);
  const score = (((data.length - incorrectAnswers.length) / data.length) * 100).toFixed(1);
  const isFinished = selectedIndex === data.length;

  useEffect(() => {
    const node = percentageRef.current;
    if (!node) return;
    const percentageBefore = (Math.max(selectedIndex - 1, 0) / data.length) * 100;
    const percentageCurrent = (selectedIndex / data.length) * 100;

    const controls = animate(percentageBefore, percentageCurrent, {
      onUpdate: (value) => {
        node.textContent = `${value.toFixed(2)}%`;
      },
    });
    return () => controls.stop();
  });

  const nextCard = () => {
    setSelectedIndex((i) => i + 1);
  };

  const onAnswer = (rightAnswer: boolean, data: QuestionData) => {
    const stateUpdater = rightAnswer ? setCorrectAnswers : setIncorrectAnswers;
    stateUpdater((prevState) => {
      if (prevState == null) return [data];
      return [...prevState, data];
    });
    nextCard();
  };

  const handleRestart = () => {
    setSelectedIndex(0);
    setIncorrectAnswers([]);
    setCorrectAnswers([]);
    setIsReviewOpened(false);
    onRestart();
  };

  return (
    <div className={styles.container}>
      <AnimatePresence exitBeforeEnter>
        {!isFinished ? (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className={styles.progress}>
              <div className={styles.bar}>
                <motion.div
                  className={styles.bar__fill}
                  animate={{ width: `${(selectedIndex / data.length) * 100}%` }}
                  transition={{ ease: "easeInOut" }}
                >
                  <p className={styles.percentage}>
                    <span ref={percentageRef}>0.00%</span>
                  </p>
                </motion.div>
              </div>
            </div>
            <DataWrapper type={dataClass}>
              <AnimatePresence>
                {data.map((d, i: number) => {
                  {
                    return (
                      selectedIndex === i && <FlipCard dataClass={dataClass} onAnswer={onAnswer} key={i} data={d} />
                    );
                  }
                })}
              </AnimatePresence>
            </DataWrapper>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="endcard"
              className={styles.endCard}
            >
              <p className={styles.endCard__subtitle}>Finish!</p>
              <h1 className={styles.endCard__title}>
                Your end score was <span>{score}%</span>
              </h1>
              <button onClick={() => setIsReviewOpened(true)}>
                <List />
                Review Answers
              </button>
              <button onClick={() => handleRestart()}>
                <Play />
                Restart
              </button>
              {isReviewOpened && (
                <DataWrapper type={dataClass}>
                  <section className={styles.showdown}>
                    {incorrectAnswers && (
                      <div>
                        <h2 className={styles.title__incorrect}>Incorrect Answers ({incorrectAnswers.length})</h2>
                        <div className={classNames(styles.list, styles.incorrect)}>
                          {incorrectAnswers.map((a) => {
                            const { answer, question } = a;
                            return (
                              <div className={styles.list__item} key={`${question}-${answer}`}>
                                <div className={styles.question}>{question}</div>
                                <div className={styles.spacer}></div>
                                <ArrowRightCircle />
                                <FormatedData type={dataClass} data={answer} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {correctAnswers && (
                      <div>
                        <h2 className={styles.title__correct}>Correct Answers ({correctAnswers.length})</h2>
                        <div className={classNames(styles.list, styles.correct)}>
                          {correctAnswers.map((a) => {
                            const { answer, question } = a;
                            return (
                              <div className={styles.list__item} key={`${question}-${answer}`}>
                                <div className={styles.question}>{question}</div>
                                <div className={styles.spacer}></div>
                                <ArrowRightCircle />
                                <FormatedData type={dataClass} data={answer} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </section>
                </DataWrapper>
              )}
              {/* <motion.span
                initial={{ scale: 1, translateX: "-50%", translateY: "-50%", y: 0, opacity: 0 }}
                animate={{ y: 125, opacity: 1 }}
                exit={{ scale: 0 }}
                onClick={onRestart}
                className={styles.reload}
              >
                <Play />
                Restart
              </motion.span> */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Viewer;
