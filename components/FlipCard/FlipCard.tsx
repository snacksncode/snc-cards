import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import Back from "../Back";
import Front from "../Front";
import styles from "./FlipCard.module.scss";
import classNames from "classnames";
import Close from "../../icons/Close";
import Tick from "../../icons/Tick";

const variants = {
  unflipped: { transform: "rotateX(0deg)" },
  flipped: { transform: "rotateX(180deg)" },
};

interface Data {
  question: string;
  answer: string;
}

interface Props {
  data: Data;
  onAnswer: Function;
  // onCorrect: Function;
  // onWrong: Function;
  // onClick: Function;
  // isFlipped: boolean;
  // isCorrect: boolean | null;
}

const Correct = ({ onAnimationComplete }: { onAnimationComplete: Function }) => {
  return (
    <motion.div
      className={styles.correct_blob}
      initial={{ clipPath: "circle(0% at center)" }}
      animate={{ clipPath: "circle(100% at center)" }}
      exit={{ clipPath: "circle(0% at center)" }}
      transition={{ type: "spring", damping: 25 }}
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onAnimationComplete={() => {
          setTimeout(onAnimationComplete(), 750);
        }}
        transition={{ delay: 0.25 }}
      >
        <Tick />
      </motion.span>
    </motion.div>
  );
};

const Wrong = ({ onAnimationComplete }: { onAnimationComplete: Function }) => {
  return (
    <motion.div
      className={styles.wrong_blob}
      initial={{ clipPath: "circle(0% at center)" }}
      animate={{ clipPath: "circle(100% at center)" }}
      exit={{ clipPath: "circle(0% at center)" }}
      transition={{ type: "spring", damping: 25 }}
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onAnimationComplete={() => {
          setTimeout(onAnimationComplete(), 750);
        }}
        transition={{ delay: 0.25 }}
      >
        <Close />
      </motion.span>
    </motion.div>
  );
};

const FlipCard = ({ data, onAnswer }: Props) => {
  const [allowKeyboardEvents, setAllowKeyboardEvents] = useState(false);
  const [answeredRight, setAnsweredRight] = useState<boolean | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const wrapperClasses = classNames(styles.wrapper, {
    [`${styles["wrapper--correct"]}`]: answeredRight === true,
    [`${styles["wrapper--wrong"]}`]: answeredRight === false,
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isFlipped || !allowKeyboardEvents) return;
      if (e.key === "Enter") setIsFlipped(true);
    };
    document.addEventListener("keyup", handler);
    return () => {
      document.removeEventListener("keyup", handler);
    };
  }, [isFlipped, allowKeyboardEvents]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isFlipped || !allowKeyboardEvents) return;
      if (e.key === "Enter" || e.key === " ") {
        setAllowKeyboardEvents(false);
        setAnsweredRight(true);
      }
      if (e.key === "Backspace") {
        setAllowKeyboardEvents(false);
        setAnsweredRight(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [isFlipped, allowKeyboardEvents]);

  return (
    <motion.main
      initial={{ opacity: 0, x: "50%", y: "-50%", scale: 0.5 }}
      animate={{ opacity: 1, x: "-50%", scale: 1 }}
      exit={{ opacity: 0, x: "-150%", scale: 0.5 }}
      transition={{ type: "spring", damping: 12 }}
      onClick={() => setIsFlipped(true)}
      onAnimationComplete={() => setAllowKeyboardEvents(true)}
      className={wrapperClasses}
      style={{
        maxWidth: `calc(${Math.max(data.answer.replace(" | ", "").length, data.question.length)}ch * 2 + 14rem)`,
      }}
    >
      <motion.div
        variants={variants}
        initial="unflipped"
        transition={{ type: "spring", stiffness: 100 }}
        animate={isFlipped ? "flipped" : "unflipped"}
        onAnimationStart={() => setAllowKeyboardEvents(false)}
        onAnimationComplete={() => setAllowKeyboardEvents(true)}
        className={styles.content}
      >
        <div className={styles.front}>
          <Front data={data.question} />
          <div className={styles.repeated_watermark} data-text="question">
            question
          </div>
        </div>
        <div className={styles.back}>
          <AnimatePresence>
            {answeredRight === true && <Correct onAnimationComplete={onAnswer} />}
            {answeredRight === false && <Wrong onAnimationComplete={onAnswer} />}
          </AnimatePresence>
          <Back data={data.answer} />
          <div className={styles.repeated_watermark} data-text="answer">
            answer
          </div>
        </div>
      </motion.div>
    </motion.main>
  );
};

export default FlipCard;
