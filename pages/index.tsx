import type { NextPage } from "next";
import styles from "@styles/Home.module.scss";
import FlipCard from "../components/FlipCard";
import wordsData from "../data/irregular";
import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import shuffle from "../utils/shuffle";
import Button from "../components/Button";

const Home: NextPage = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  // const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  let [data, setData] = useState<any[] | null>(null);

  useEffect(() => {
    setData(shuffle(wordsData));
  }, []);

  // const onClick = () => {
  //   setIsFlipped(true);
  // };

  // const onCorrect = () => {
  //   setIsCorrect(true);
  // };

  // const onWrong = () => {
  //   setIsCorrect(false);
  // };

  const nextCard = () => {
    // setIsCorrect(null);
    // setIsFlipped(false);
    setSelectedIndex((i) => i + 1);
  };

  const onAnswer = () => {
    nextCard();
  };

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {data &&
          data.map((d, i) => {
            {
              return (
                selectedIndex === i && (
                  <FlipCard
                    // isCorrect={isCorrect}
                    // onCorrect={onCorrect}
                    // onWrong={onWrong}
                    onAnswer={onAnswer}
                    key={i}
                    data={d}
                  />
                )
              );
            }
          })}
      </AnimatePresence>
      {/* {isFlipped && (
        <div className={styles.buttons}>
          <Button onClick={() => onCorrect()}>
            Correct
          </Button>
          <Button isVisible={isFlipped} onClick={() => onWrong()}>
            Wrong
          </Button>
        </div>
      )} */}
    </div>
  );
};

export default Home;
