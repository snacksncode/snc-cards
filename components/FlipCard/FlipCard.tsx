import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import Back from "../Back";
import Front from "../Front";
import styles from "./FlipCard.module.scss";
import useWindowSize from "@hooks/useWindowSize";
import FlipCardButton from "@components/FlipCardButton";
import useEventListener from "@hooks/useEventListener";
import { CloseSquare, TickSquare } from "iconsax-react";

const flip = {
  unflipped: { transform: "rotateX(0deg)" },
  flipped: { transform: "rotateX(180deg)", transition: { type: "spring", stiffness: 100 } },
};

const card = {
  out: { opacity: 0, x: "50%", y: "-50%", scale: 0.25 },
  in: { opacity: 1, x: "-50%", scale: 1, transition: { type: "spring", damping: 12 } },
  outExit: { opacity: 0, x: "-150%", scale: 0.25, transition: { type: "spring", damping: 12 } },
};

interface Props {
  dataClass?: ClassString;
  data: QuestionData;
  onAnswer: (rightAnswer: boolean, questionData: QuestionData) => void;
}

const FlipCard = ({ data, dataClass, onAnswer }: Props) => {
  if (dataClass == null) throw new Error("dataClass is not a string");
  const [isFlipped, setIsFlipped] = useState(false);
  const [answeredRight, setAnsweredRight] = useState<boolean | null>(null);
  const { width } = useWindowSize();

  const getCardWidth = () => {
    if (!width) return { isMobile: undefined, cardWidth: undefined };
    // math breaks stuff
    const contentSize =
      dataClass !== "math"
        ? Math.max(data.answer.replace(" | ", "").length, data.question.length)
        : data.question.length;
    let calculatedWidth = Math.max(contentSize * 8 * 2.85 + 128, 350);
    if (calculatedWidth > 1000) calculatedWidth /= 1.75;
    const isMobile = width - 320 < calculatedWidth;
    if (isMobile) calculatedWidth = width - 32;
    return { isMobile: isMobile, cardWidth: calculatedWidth };
  };

  const { isMobile, cardWidth } = getCardWidth();

  useEventListener({
    type: "keydown",
    listener: (e) => {
      if (!(e instanceof KeyboardEvent) || !isFlipped || answeredRight != null) return;
      if (e.key === "Enter" || e.key === " ") {
        setAnsweredRight(true);
      }
      if (e.key === "Backspace" || e.key === "Escape") {
        setAnsweredRight(false);
      }
    },
  });

  useEventListener({
    type: "keydown",
    listener: (e) => {
      if (!(e instanceof KeyboardEvent) || isFlipped || answeredRight != null) return;
      if (e.key === "Enter") setIsFlipped(true);
    },
  });

  const forwardAnswer = () => {
    if (answeredRight == null) return;
    onAnswer(answeredRight, data);
  };

  return (
    <motion.div
      variants={card}
      initial="out"
      animate="in"
      exit="outExit"
      onClick={() => setIsFlipped(true)}
      className={styles.wrapper}
      tabIndex={0}
      style={{
        maxWidth: cardWidth,
      }}
    >
      <AnimatePresence>
        {isFlipped && answeredRight == null && (
          <>
            <FlipCardButton
              isMobile={isMobile}
              onClick={() => setAnsweredRight(false)}
              icon={<CloseSquare color="currentColor" variant="Bold" />}
              color="red"
              position="left"
            />
            <FlipCardButton
              icon={<TickSquare color="currentColor" variant="Bold" />}
              isMobile={isMobile}
              onClick={() => setAnsweredRight(true)}
              color="green"
              position="right"
            />
          </>
        )}
      </AnimatePresence>
      <motion.div
        variants={flip}
        initial="unflipped"
        animate={isFlipped ? "flipped" : "unflipped"}
        className={styles.content}
      >
        <Front isMobile={isMobile} data={data.question} />
        <Back
          answeredRight={answeredRight}
          dataClass={dataClass}
          isMobile={isMobile}
          forwardAnswer={forwardAnswer}
          data={data.answer}
        />
      </motion.div>
    </motion.div>
  );
};

export default FlipCard;
