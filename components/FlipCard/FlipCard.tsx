import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import Back from "../Back";
import Front from "../Front";
import styles from "./FlipCard.module.scss";
import useWindowSize from "@hooks/useWindowSize";
import FlipCardButton from "@components/FlipCardButton";
import useEventListener from "@hooks/useEventListener";
import { CloseSquare, TickSquare, MessageQuestion } from "iconsax-react";

const flip = {
  unflipped: { rotateX: 0, transition: { type: "spring", stiffness: 100 } },
  flipped: { rotateX: 180, transition: { type: "spring", stiffness: 100 } },
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
      onClickCapture={() => setIsFlipped(true)}
      className={styles.wrapper}
      tabIndex={0}
      style={{
        maxWidth: cardWidth,
      }}
    >
      <AnimatePresence>
        {isFlipped && answeredRight == null && (
          <>
            <motion.div
              className={styles.questionPreview}
              initial={{ top: 0, left: "50%", x: "-50%", y: 0, opacity: 0 }}
              animate={{ y: "calc(-100% - 20px)", opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              exit={{ y: 0, opacity: 0 }}
              onClickCapture={() => setIsFlipped(false)}
            >
              <MessageQuestion color="currentColor" variant="Linear" />
              {data.question}
            </motion.div>
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
