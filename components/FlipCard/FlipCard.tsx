import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import Back from "../Back";
import Front from "../Front";
import styles from "./FlipCard.module.scss";
import classNames from "classnames";
import Close from "../../icons/Close";
import Tick from "../../icons/Tick";
import Button from "@components/Button";

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
}

const Correct = ({ onAnimationComplete }: { onAnimationComplete: Function }) => {
  return (
    <motion.div
      className={styles.correct_blob}
      style={{ backgroundColor: "var(--clr-accent-green-darker)" }}
      initial={{ clipPath: "circle(0% at center)" }}
      animate={{ clipPath: "circle(100% at center)" }}
      transition={{ duration: 0.75 }}
    >
      <motion.div
        className={styles.correct_blob}
        initial={{ clipPath: "circle(0% at center)" }}
        animate={{ clipPath: "circle(100% at center)" }}
        transition={{ delay: 0.25, duration: 0.5 }}
        onAnimationComplete={() => onAnimationComplete()}
      >
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}>
          <Tick />
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

const Wrong = ({ onAnimationComplete }: { onAnimationComplete: Function }) => {
  return (
    <motion.div
      className={styles.wrong_blob}
      style={{ backgroundColor: "var(--clr-accent-red-darker)" }}
      initial={{ clipPath: "circle(0% at center)" }}
      animate={{ clipPath: "circle(100% at center)" }}
      transition={{ duration: 0.75 }}
    >
      <motion.div
        className={styles.wrong_blob}
        initial={{ clipPath: "circle(0% at center)" }}
        animate={{ clipPath: "circle(100% at center)" }}
        transition={{ delay: 0.25, duration: 0.5 }}
        onAnimationComplete={() => onAnimationComplete()}
      >
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}>
          <Close />
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

const FlipCard = ({ data, onAnswer }: Props) => {
  const allowKeyboardEvents = useRef(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answeredRight, setAnsweredRight] = useState<boolean | null>(null);
  const wrapperClasses = classNames(styles.wrapper, {
    [`${styles["wrapper--correct"]}`]: answeredRight === true,
    [`${styles["wrapper--wrong"]}`]: answeredRight === false,
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isFlipped || answeredRight != null) return;
      if (e.key === "Enter") setIsFlipped(true);
    };
    document.addEventListener("keyup", handler);
    return () => {
      document.removeEventListener("keyup", handler);
    };
  }, [isFlipped, answeredRight]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isFlipped || !allowKeyboardEvents.current || answeredRight != null) return;
      if (e.key === "Enter" || e.key === " ") {
        allowKeyboardEvents.current = false;
        setAnsweredRight(true);
      }
      if (e.key === "Backspace") {
        allowKeyboardEvents.current = false;
        setAnsweredRight(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [isFlipped, answeredRight]);

  const forwardAnswer = () => onAnswer(answeredRight);

  return (
    <motion.main
      initial={{ opacity: 0, x: "50%", y: "-50%", scale: 0.25 }}
      animate={{ opacity: 1, x: "-50%", scale: 1 }}
      exit={{ opacity: 0, x: "-150%", scale: 0.25 }}
      transition={{ type: "spring", damping: 12 }}
      onClick={() => setIsFlipped(true)}
      onAnimationComplete={() => (allowKeyboardEvents.current = true)}
      className={wrapperClasses}
      style={{
        maxWidth: `calc(${Math.max(data.answer.replace(" | ", "").length, data.question.length)}ch * 2 + 14rem)`,
      }}
    >
      <AnimatePresence>
        {isFlipped && answeredRight == null && (
          <>
            <motion.button
              initial={{ x: 0, top: "50%", translateY: "-50%", opacity: 0 }}
              animate={{ x: -150, opacity: 1 }}
              exit={{ x: 0 }}
              transition={{ type: "spring" }}
              whileHover={{ scale: 1.25 }}
              className={styles.wrong_button}
              onClick={() => setAnsweredRight(false)}
            >
              <Close />
            </motion.button>
            <motion.button
              initial={{ x: 0, right: 0, top: "50%", translateY: "-50%", opacity: 0 }}
              animate={{ x: 150, opacity: 1 }}
              exit={{ x: 0 }}
              transition={{ type: "spring" }}
              whileHover={{ scale: 1.25 }}
              className={styles.correct_button}
              onClick={() => setAnsweredRight(true)}
            >
              <Tick />
            </motion.button>
          </>
        )}
      </AnimatePresence>
      <motion.div
        variants={variants}
        initial="unflipped"
        transition={{ type: "spring", stiffness: 100 }}
        animate={isFlipped ? "flipped" : "unflipped"}
        onAnimationStart={() => (allowKeyboardEvents.current = false)}
        onAnimationComplete={() => (allowKeyboardEvents.current = true)}
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
            {answeredRight === true && <Correct onAnimationComplete={forwardAnswer} />}
            {answeredRight === false && <Wrong onAnimationComplete={forwardAnswer} />}
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
