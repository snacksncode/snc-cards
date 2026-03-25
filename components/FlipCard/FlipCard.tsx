import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Back from "../Back";
import Front from "../Front";
import useWindowSize from "@hooks/useWindowSize";
import { getCardDimensions } from "@lib/utils";
import FlipCardButton from "@components/FlipCardButton";
import { CloseSquare, TickSquare, MessageQuestion } from "@components/icons";
import { useEventListener } from "@hooks/useEventListener";
import type { ClassString, Question } from "@/types";

const flipVariants = {
  unflipped: { rotateX: 0, transition: { type: "spring" as const, stiffness: 200, damping: 20 } },
  flipped: { rotateX: 180, transition: { type: "spring" as const, stiffness: 200, damping: 20 } },
};

const springTransition = { type: "spring" as const, stiffness: 120, damping: 20 };

const cardVariants = {
  out: (dir: 'forward' | 'backward') => ({
    opacity: 0,
    x: dir === 'forward' ? "50%" : "-150%",
    y: "-50%",
    scale: 0.25,
  }),
  in: {
    opacity: 1,
    x: "-50%",
    y: "-50%",
    scale: 1,
    transition: springTransition,
  },
  outExit: (dir: 'forward' | 'backward') => ({
    opacity: 0,
    x: dir === 'forward' ? "-150%" : "50%",
    y: "-50%",
    scale: 0.25,
    transition: springTransition,
  }),
};

interface Props {
  dataClass?: ClassString;
  data: Question;
  onAnswer: (rightAnswer: boolean, questionData: Question) => void;
  direction?: 'forward' | 'backward';
  onFlipChange?: (flipped: boolean) => void;
}

const FlipCard = ({ data, dataClass, onAnswer, direction = 'forward', onFlipChange }: Props) => {
  if (dataClass == null) throw new Error("dataClass is not a string");
  const [isFlipped, setIsFlipped] = useState(false);
  const [answeredRight, setAnsweredRight] = useState<boolean | null>(null);
  const { width } = useWindowSize();
  const { isMobile, cardWidth } = getCardDimensions(data.question, data.answer, width);

  const flip = () => { setIsFlipped(true); onFlipChange?.(true); };
  const unflip = () => { setIsFlipped(false); onFlipChange?.(false); };

  useEventListener("keydown", (e) => {
    if (!(e instanceof KeyboardEvent) || !isFlipped || answeredRight != null) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setAnsweredRight(true); }
    if (e.key === "Backspace") setAnsweredRight(false);
    if (e.key === "Escape") unflip();
  });

  useEventListener("keydown", (e) => {
    if (!(e instanceof KeyboardEvent) || isFlipped || answeredRight != null) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
  });

  const forwardAnswer = () => {
    if (answeredRight == null) return;
    onAnswer(answeredRight, data);
  };

  return (
    <motion.div
      key={`card_${data.id}`}
      custom={direction}
      variants={cardVariants}
      initial="out"
      animate="in"
      exit="outExit"
      tabIndex={0}
      role="button"
      aria-label="Flip card"
      onClickCapture={flip}
      className="perspective-1000 w-full h-[50vh] max-h-[calc(5*3em)] select-none absolute top-1/2 isolate rounded-lg left-1/2 will-change-transform focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-accent-blue focus-visible:outline-offset-[2rem]"
      style={{
        maxWidth: cardWidth,
      }}
    >
      <AnimatePresence>
        {isFlipped && answeredRight == null && (
          <>
            <motion.div
              className="absolute rounded-[5px] text-accent-blue font-medium text-base border-2 border-accent-blue max-w-full w-max bg-bg-400 text-center grid grid-cols-[repeat(2,auto)] items-center justify-center cursor-pointer px-[1em] py-[0.5em] gap-2 [&_svg]:w-[1.75em] [&_svg]:h-[1.75em] focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-current focus-visible:outline-offset-[0.75rem]"
              initial={{ top: 0, left: "50%", x: "-50%", y: 0, opacity: 0 }}
              animate={{ y: "calc(-100% - 20px)", opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              exit={{ y: 0, opacity: 0 }}
              role="button"
              aria-label="Back to question"
              onClickCapture={unflip}
            >
              <MessageQuestion color="currentColor" />
              {data.question}
            </motion.div>
            <FlipCardButton
              isMobile={isMobile}
              onClick={() => setAnsweredRight(false)}
              icon={<CloseSquare color="currentColor" />}
              color="red"
              position="left"
              aria-label="Mark as wrong"
            />
            <FlipCardButton
              icon={<TickSquare color="currentColor" />}
              isMobile={isMobile}
              onClick={() => setAnsweredRight(true)}
              color="green"
              position="right"
              aria-label="Mark as correct"
            />
          </>
        )}
      </AnimatePresence>
      <motion.div
        variants={flipVariants}
        initial="unflipped"
        animate={isFlipped ? "flipped" : "unflipped"}
        className="relative text-center w-full h-full preserve-3d shadow-[0_4px_15px_rgba(0,0,0,0.15)]"
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
