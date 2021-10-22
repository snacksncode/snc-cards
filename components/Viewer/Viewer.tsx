import styles from "./Viewer.module.scss";
import FlipCard from "@components/FlipCard";
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion } from "framer-motion";
import Play from "icons/Play";
import { MathJaxContext } from "better-react-mathjax";

interface Props {
  data: QuestionData[];
  dataClass: ClassString;
}

const DataWrapper = ({ type, children }: PropsWithChildren<{ type: ClassString }>) => {
  if (type === "math") return <MathJaxContext config={{ options: { enableMenu: false } }}>{children}</MathJaxContext>;
  return <>{children}</>;
};

const Viewer = ({ data, dataClass }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const percentageRef = useRef<HTMLParagraphElement>(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const score = (((data.length - incorrectAnswers) / data.length) * 100).toFixed(1);
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

  const onAnswer = (rightAnswer: boolean) => {
    if (!rightAnswer) setIncorrectAnswers((a) => a + 1);
    nextCard();
  };

  const onRestart = () => {
    setSelectedIndex(0);
    setIncorrectAnswers(0);
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
                ></motion.div>
              </div>
              <p className={styles.percentage} ref={percentageRef}>
                0.00%
              </p>
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
              initial={{ scale: 0, translateX: "-50%", translateY: "-50%" }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              key="endcard"
              className={styles.endCard}
            >
              <p className={styles.endCard__subtitle}>Finish!</p>
              <h1 className={styles.endCard__title}>
                Your end score was <span>{score}%</span>
              </h1>
              <div className={styles.ratio}>
                Correct to wrong answers ratio:{" "}
                <span style={{ color: "var(--clr-accent-green)" }}>{data.length - incorrectAnswers}</span> /{" "}
                <span style={{ color: "var(--clr-accent-red)" }}>{incorrectAnswers}</span>
              </div>
              <motion.span
                initial={{ scale: 1, translateX: "-50%", translateY: "-50%", y: 0, opacity: 0 }}
                animate={{ y: 125, opacity: 1 }}
                exit={{ scale: 0 }}
                onClick={onRestart}
                className={styles.reload}
              >
                <Play />
                Restart
              </motion.span>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Viewer;
