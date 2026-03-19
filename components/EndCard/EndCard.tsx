import { MessageQuestion, ArrowRotateRight, Back } from "@components/icons";
import { Button, LinkButton } from "@components/Button";
import { motion, AnimatePresence, LayoutGroup, useMotionValue, animate } from "motion/react";
import { FC, useRef, useState } from "react";
import confetti from "canvas-confetti";
import EndCardReview from "@components/EndCardReview";
import { getStreakEmojis } from "@lib/utils";
import type { CardsReviewData, SpellingReviewData, ClassString, Question } from "@/types";

interface SpellingData {
  input: string;
  expected: string;
  data: Question;
}

interface Props {
  onRestart: (newData: Question[] | null) => void;
  mode: "spelling" | "cards";
  data: CardsReviewData | SpellingReviewData;
  amount: number;
  dataClass: ClassString;
  streak: number;
}

const isSpellingData = (input: Question[] | SpellingData[]): input is SpellingData[] => {
  if ("data" in input[0]) {
    return true;
  }
  return false;
};

const getAccentHex = (cls: ClassString) => {
  switch (cls) {
    case "en":
      return "#6B9FE8";
    case "de":
      return "#E8A168";
    case "geo":
      return "#5EC87E";
  }
};

const EndCard: FC<Props> = ({ amount, data, onRestart, mode, dataClass, streak }) => {
  const [isReviewOpened, setIsReviewOpened] = useState(false);
  const score = (((amount - data.incorrect.length) / amount) * 100).toFixed(1);
  const scoreNum = useMotionValue(0);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  if (!hasAnimated.current) {
    hasAnimated.current = true;
    animate(scoreNum, parseFloat(score), {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => {
        if (scoreRef.current) scoreRef.current.textContent = v.toFixed(1) + "%";
      },
    });
    if (parseFloat(score) >= 80) {
      const color = getAccentHex(dataClass);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [color, "#ffffff", color],
      });
    }
  }
  const handleRestart = (newData: Question[] | SpellingData[] | null = null) => {
    setIsReviewOpened(false);
    if (newData && isSpellingData(newData)) {
      onRestart(newData.map((item) => item.data));
    } else {
      onRestart(newData);
    }
  };
  const handleRestartIncorrect = () => {
    handleRestart(data.incorrect);
  };
  const handleRestartAll = () => {
    handleRestart();
  };
  return (
    <LayoutGroup>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, height: "100%", y: 0 }}
        exit={{ opacity: 0 }}
        key="endcard"
        layout="position"
        className="w-full max-w-[750px] mx-8 rounded z-[2] px-4"
      >
        <h1 className="text-5xl sm:text-6xl font-serif font-bold leading-[120%] mb-4">
          Your end score was{" "}
          <span className="text-accent-green" ref={scoreRef}>
            0.0%
          </span>
        </h1>
        <p className="text-text-muted text-sm mb-4 m-0">
          {parseFloat(score) >= 80
            ? "Amazing work! 🎉"
            : parseFloat(score) >= 50
              ? "Nice work! Keep it up."
              : "Keep going! Practice makes progress."}
        </p>
        {streak >= 5 && (
          <h3>
            Highest streak: {streak}
            {getStreakEmojis(streak)}
          </h3>
        )}
        <section className="flex flex-col gap-4">
          <h5 className="text-xl text-accent-blue m-0 relative isolate">
            <span className="z-[1] pr-2 bg-bg-300 relative">What&apos;s next?</span>
            <span
              className="absolute inset-0 top-1/2 h-0.5 -z-[1] bg-current"
              aria-hidden="true"
            />
          </h5>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
            <LinkButton href="/" variant="ghost" size="sm" accent="var(--color-accent-blue)">
              <Back className="size-4" />
              Go Back
            </LinkButton>
            <Button
              variant="ghost"
              size="sm"
              accent="var(--color-accent-peachy)"
              onClick={() => setIsReviewOpened((s) => !s)}
            >
              <MessageQuestion className="size-4" />
              Review
            </Button>
            <Button variant="ghost" size="sm" accent="var(--color-accent-green)" onClick={handleRestartAll}>
              <ArrowRotateRight className="size-4" />
              Restart
            </Button>
            {data.incorrect.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                accent="var(--color-accent-pink)"
                onClick={handleRestartIncorrect}
              >
                <ArrowRotateRight className="size-4" />
                Incorrect
              </Button>
            )}
          </div>
        </section>
        <AnimatePresence>
          {isReviewOpened && <EndCardReview data={data} mode={mode} dataClass={dataClass} />}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
};

export default EndCard;
