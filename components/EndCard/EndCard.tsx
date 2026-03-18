import { cn } from "@lib/cn";
import { MessageQuestion, ArrowRotateRight, Back } from "@components/icons";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { FC, useState } from "react";
import EndCardReview from "@components/EndCardReview";
import { getStreakEmojis } from "@lib/utils";
import Link from "next/link";
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

const buttonBase = cn(
  "bg-transparent cursor-pointer border-2 border-[var(--accent)] text-[var(--accent)]",
  "rounded px-3 py-1.5 font-bold text-sm inline-flex items-center justify-center gap-2",
  "transition-colors duration-200",
  "hover:bg-[var(--accent)] hover:text-bg-200",
  "focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2",
  "focus-visible:bg-[var(--accent)] focus-visible:text-bg-200"
);

const EndCard: FC<Props> = ({ amount, data, onRestart, mode, dataClass, streak }) => {
  const [isReviewOpened, setIsReviewOpened] = useState(false);
  const score = (((amount - data.incorrect.length) / amount) * 100).toFixed(1);
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
        <h1 className="text-4xl sm:text-[2.75rem] font-serif font-bold leading-[120%] mb-4">
          Your end score was <span className="text-accent-green">{score}%</span>
        </h1>
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
            <Link
              href="/"
              className={buttonBase}
              style={{ "--accent": "var(--color-accent-blue)" } as React.CSSProperties}
            >
              <Back className="size-4" />
              Go Back
            </Link>
            <button
              className={buttonBase}
              style={{ "--accent": "var(--color-accent-peachy)" } as React.CSSProperties}
              onClick={() => setIsReviewOpened((s) => !s)}
            >
              <MessageQuestion className="size-4" />
              Review
            </button>
            <button
              className={buttonBase}
              style={{ "--accent": "var(--color-accent-green)" } as React.CSSProperties}
              onClick={handleRestartAll}
            >
              <ArrowRotateRight className="size-4" />
              Restart
            </button>
            {data.incorrect.length > 0 && (
              <button
                className={buttonBase}
                style={{ "--accent": "var(--color-accent-pink)" } as React.CSSProperties}
                onClick={handleRestartIncorrect}
              >
                <ArrowRotateRight className="size-4" />
                Incorrect
              </button>
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
