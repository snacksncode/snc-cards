import styles from "./Viewer.module.scss";
import React, { PropsWithChildren, useState } from "react";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import classNames from "classnames";
import ProgressBar from "@components/ProgressBar";
import { ArrowCircleDown2, NoteText, Play } from "iconsax-react";

interface Props {
  rawData: QuestionData[];
  dataClass?: ClassString;
  Component: React.FC<{
    dataClass?: ClassString;
    data: QuestionData;
    onAnswer: (rightAnswer: boolean, data: QuestionData) => void;
  }>;
}

const DataWrapper = ({ type, children }: PropsWithChildren<{ type?: ClassString }>) => {
  if (type === "math") return <MathJaxContext config={{ options: { enableMenu: false } }}>{children}</MathJaxContext>;
  return <>{children}</>;
};

const FormatedData = ({ data, type }: { data: string; type?: ClassString }) => {
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

const Viewer = ({ rawData, dataClass, Component }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isReviewOpened, setIsReviewOpened] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState<QuestionData[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<QuestionData[]>([]);
  const score = (((rawData.length - incorrectAnswers.length) / rawData.length) * 100).toFixed(1);
  const isFinished = selectedIndex === rawData.length;
  const [magicNumber, setMagicNumber] = useState(Math.random()); //uhmmm fancier far of re-triggering useEffect lmao

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
    setMagicNumber(Math.random());
  };

  return (
    <div className={styles.container}>
      <AnimatePresence exitBeforeEnter>
        {!isFinished ? (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProgressBar currentAmount={selectedIndex} maxAmount={rawData.length} />
            <DataWrapper type={dataClass}>
              <AnimatePresence>
                {rawData.map((d, i: number) => {
                  {
                    return (
                      selectedIndex === i && <Component dataClass={dataClass} onAnswer={onAnswer} key={i} data={d} />
                    );
                  }
                })}
              </AnimatePresence>
            </DataWrapper>
          </motion.div>
        ) : (
          <AnimateSharedLayout>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="endcard"
              layout="position"
              className={styles.endCard}
            >
              <h1 className={styles.endCard__title}>
                Your end score was <span>{score}%</span>
              </h1>
              <section className={styles.buttons}>
                <h5>
                  <span>What&apos;s next?</span>
                </h5>
                <button
                  className={classNames(styles.button, styles.orange)}
                  onClick={() => setIsReviewOpened((s) => !s)}
                >
                  <NoteText size="32" color="currentColor" variant="Bold" />
                  Review Answers
                </button>
                <button className={styles.button} onClick={() => handleRestart()}>
                  <Play />
                  Restart
                </button>
              </section>
              <AnimatePresence>
                {isReviewOpened && (
                  <DataWrapper type={dataClass}>
                    <motion.section
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={styles.showdown}
                    >
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
                                  <ArrowCircleDown2 size="32" variant="Bold" />
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
                                  <ArrowCircleDown2 size="32" variant="Bold" />
                                  <FormatedData type={dataClass} data={answer} />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.section>
                  </DataWrapper>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimateSharedLayout>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Viewer;
