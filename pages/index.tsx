import type { NextPage } from "next";
import styles from "@styles/Home.module.scss";
import FlipCard from "@components/FlipCard";
import wordsData from "../data/irregular";
import React, { useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion } from "framer-motion";
import shuffle from "../utils/shuffle";
import Play from "icons/Play";

const Home: NextPage = () => {
  let [data, setData] = useState(wordsData);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const percentageRef = useRef<HTMLParagraphElement>(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const score = ((data.length - incorrectAnswers) / data.length) * 100;
  const isFinished = selectedIndex === data.length;

  useEffect(() => {
    setData(shuffle(wordsData));
  }, []);

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
  };

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {!isFinished && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className={styles.progress}>
              <div className={styles.bar}>
                <motion.div
                  className={styles.bar__fill}
                  animate={{ width: `${(selectedIndex / data.length) * 100}%` }}
                  transition={{ ease: "easeInOut" }}
                ></motion.div>
              </div>
              <p className={styles.percentage} ref={percentageRef}></p>
            </div>
            <AnimatePresence>
              {data.map((d, i) => {
                {
                  return selectedIndex === i && <FlipCard onAnswer={onAnswer} key={i} data={d} />;
                }
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {isFinished && (
        <>
          <motion.div
            initial={{ scale: 0, translateX: "-50%", translateY: "-50%" }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
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
          </motion.div>
          <motion.span
            initial={{ translateX: "-50%", scale: 1, translateY: "-50%", y: 0, opacity: 0 }}
            animate={{ y: 150, opacity: 1, transition: { delay: 1 } }}
            onClick={onRestart}
            className={styles.reload}
          >
            <Play />
            Restart
          </motion.span>
        </>
      )}
    </div>
  );
};

export default Home;
