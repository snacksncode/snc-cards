import type { NextPage } from "next";
import styles from "@styles/Home.module.scss";
import FlipCard from "@components/FlipCard";
import wordsData from "../data/irregular";
import React, { useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion } from "framer-motion";
import shuffle from "../utils/shuffle";
// import Button from "@components/Button";

const Home: NextPage = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const percentageRef = useRef<HTMLParagraphElement>(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  let [data, setData] = useState(wordsData);

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

  return (
    <div className={styles.container}>
      <div className={styles.progress}>
        <div className={styles.bar}>
          <motion.div
            className={styles.bar__fill}
            animate={{ width: `${(selectedIndex / data.length) * 100}%` }}
          ></motion.div>
        </div>
        <p className={styles.percentage} ref={percentageRef}></p>
      </div>
      <AnimatePresence>
        {data &&
          data.map((d, i) => {
            {
              return selectedIndex === i && <FlipCard onAnswer={onAnswer} key={i} data={d} />;
            }
          })}
      </AnimatePresence>
    </div>
  );
};

export default Home;
