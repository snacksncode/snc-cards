import { cn } from "@lib/cn";
import { motion } from "motion/react";
import { ArrowCircleDown2 } from "@components/icons";
import { FC } from "react";
import type { CardsReviewData, SpellingReviewData, ClassString, Question } from "@/types";

interface SpellingData {
  input: string;
  expected: string;
  data: Question;
}

interface Props {
  mode: "spelling" | "cards";
  data: CardsReviewData | SpellingReviewData;
  dataClass: ClassString;
}

const EndCardList: FC<{
  dataClass: ClassString;
  data: Question | SpellingData;
  mode: "spelling" | "cards";
}> = ({ data, mode }) => {
  if (mode === "cards") {
    const { answer, question } = data as Question;
    return (
      <div
        className={cn(
          "p-4 shadow-sm rounded bg-bg-400",
          "grid grid-cols-1 grid-rows-[auto_40px_auto]",
          "sm:grid-cols-[1fr_20px_1fr] sm:grid-rows-[auto] sm:gap-x-4"
        )}
      >
        <div className="text-center text-lg font-medium sm:text-left">{question}</div>
        <div className="hidden sm:block h-full w-[3px] rounded-sm bg-bg-500 place-self-center" />
        <ArrowCircleDown2 className="size-5 place-self-center m-1 text-white sm:hidden" />
        <div className="text-center text-lg font-bold text-[var(--clr-accent)] sm:text-right">
          {answer}
        </div>
      </div>
    );
  }
  const {
    data: { answer, question },
    expected,
    input,
  } = data as SpellingData;
  return (
    <div
      className={cn(
        "p-4 shadow-sm rounded bg-bg-400",
        "grid grid-cols-1 grid-rows-[auto_40px_auto]",
        "sm:grid-cols-[1fr_20px_1fr] sm:grid-rows-[auto] sm:gap-x-4"
      )}
    >
      <div className="text-center text-lg font-medium sm:text-left">
        <small className="text-text-muted block mb-2 text-center sm:text-left">{question}</small>
        <div>
          {expected !== answer ? (
            <span>
              {expected} <small className="text-xs text-[var(--clr-accent)] font-bold">( {answer} )</small>
            </span>
          ) : (
            expected
          )}
        </div>
      </div>
      <div className="hidden sm:block h-full w-[3px] rounded-sm bg-bg-500 place-self-center" />
      <ArrowCircleDown2 className="size-5 place-self-center m-1 text-white sm:hidden" />
      <div>
        <small className="text-text-muted block mb-2 text-center sm:text-right">You typed</small>
        <div className="text-center text-lg font-bold text-[var(--clr-accent)] sm:text-right">
          {input}
        </div>
      </div>
    </div>
  );
};

const EndCardReview: FC<Props> = ({ mode, data, dataClass }) => {
  const { incorrect, correct } = data;
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mt-6 flex flex-col gap-8"
    >
      {incorrect.length > 0 && (
        <div>
          <h2 className="text-xl sm:text-2xl text-accent-red">Incorrect Answers ({incorrect.length})</h2>
          <div
            className="grid grid-cols-1 gap-y-4"
            style={{ "--clr-accent": "var(--color-accent-red)" } as React.CSSProperties}
          >
            {incorrect.map((answerData, answerIdx) => {
              return (
                <EndCardList
                  data={answerData}
                  dataClass={dataClass}
                  mode={mode}
                  key={`${JSON.stringify(answerData)}_${answerIdx}`}
                />
              );
            })}
          </div>
        </div>
      )}
      {correct.length > 0 && (
        <div>
          <h2 className="text-xl sm:text-2xl text-accent-green">Correct Answers ({correct.length})</h2>
          <div
            className="grid grid-cols-1 gap-y-4"
            style={{ "--clr-accent": "var(--color-accent-green)" } as React.CSSProperties}
          >
            {correct.map((answerData, answerIdx) => {
              return (
                <EndCardList
                  data={answerData}
                  dataClass={dataClass}
                  mode={mode}
                  key={`${JSON.stringify(answerData)}_${answerIdx}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default EndCardReview;
