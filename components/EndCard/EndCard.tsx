import { ArrowRotateRight, Back, ArrowCircleDown2 } from "@components/icons";
import { Button, LinkButton } from "@components/Button";
import { motion, AnimatePresence, LayoutGroup, useMotionValue, animate, HTMLMotionProps } from "motion/react";
import { FC, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Collapsible } from "@base-ui/react/collapsible";
import { Menu } from "@base-ui/react/menu";
import { cn } from "@lib/cn";
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

const EndCard: FC<Props> = ({ amount, data, onRestart, mode, dataClass, streak }) => {
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

  const [menuOpen, setMenuOpen] = useState(false);
  const { incorrect, correct } = data;

  return (
    <LayoutGroup>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, height: "100%", y: 0 }}
        exit={{ opacity: 0 }}
        key="endcard"
        layout="position"
        className="w-full max-w-[750px] mx-8 rounded z-[2] px-4 pt-[15vh]"
      >
        <h1 className="text-5xl sm:text-6xl font-serif font-bold leading-[120%] mb-4">
          Your end score was{" "}
          <span className="text-accent-green" ref={scoreRef}>
            0.0%
          </span>
        </h1>
        <p className="text-text-muted text-sm mb-8 m-0">
          {parseFloat(score) >= 80
            ? "Amazing work! 🎉"
            : parseFloat(score) >= 50
              ? "Nice work! Keep it up."
              : "Keep going! Practice makes progress."}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 mb-2">
          <div className="bg-bg-400 rounded-lg p-3">
            <p className="text-[0.65rem] tracking-[0.08em] text-text-muted font-medium m-0">SCORE</p>
            <p className="text-2xl font-bold text-accent-green m-0 mt-1">{score}%</p>
          </div>
          <div className="bg-bg-400 rounded-lg p-3">
            <p className="text-[0.65rem] tracking-[0.08em] text-text-muted font-medium m-0">CORRECT</p>
            <p className="text-2xl font-bold text-accent-green m-0 mt-1">{correct.length}<span className="text-sm text-text-muted font-normal">/{amount}</span></p>
          </div>
          <div className="bg-bg-400 rounded-lg p-3">
            <p className="text-[0.65rem] tracking-[0.08em] text-text-muted font-medium m-0">INCORRECT</p>
            <p className="text-2xl font-bold text-accent-red m-0 mt-1">{incorrect.length}</p>
          </div>
          <div className="bg-bg-400 rounded-lg p-3">
            <p className="text-[0.65rem] tracking-[0.08em] text-text-muted font-medium m-0">BEST STREAK</p>
            <p className="text-2xl font-bold text-accent-peachy m-0 mt-1">{streak} {getStreakEmojis(streak)}</p>
          </div>
        </div>
        <section className="flex flex-col gap-6 mt-8">
          <h5 className="text-xl text-accent-blue m-0 relative isolate">
            <span className="z-[1] pr-2 bg-bg-300 relative">What&apos;s next?</span>
            <span
              className="absolute inset-0 top-1/2 h-0.5 -z-[1] bg-current"
              aria-hidden="true"
            />
          </h5>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/" variant="ghost" size="sm" accent="var(--color-accent-blue)">
              <Back className="size-4" />
              Go Back
            </LinkButton>
            <Menu.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <Menu.Trigger
                render={
                  <Button variant="ghost" size="sm" accent="var(--color-accent-green)">
                    <ArrowRotateRight className="size-4" />
                    Restart
                  </Button>
                }
              />
              <AnimatePresence>
                {menuOpen && (
                  <Menu.Portal keepMounted>
                    <Menu.Positioner sideOffset={8} align="start">
                      <Menu.Popup
                        render={
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.95 }}
                            transition={{ duration: 0.12 }}
                          />
                        }
                        className="bg-bg-400 border border-bg-600 rounded-lg p-1 shadow-lg min-w-[200px] z-50"
                      >
                        <Menu.Item
                          className="flex items-center gap-2 px-3 py-2 text-sm text-text rounded cursor-pointer hover:bg-bg-500 transition-colors"
                          onClick={handleRestartAll}
                        >
                          <ArrowRotateRight className="size-4 text-accent-green" />
                          Entire set
                        </Menu.Item>
                        {data.incorrect.length > 0 && (
                          <Menu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm text-text rounded cursor-pointer hover:bg-bg-500 transition-colors"
                            onClick={handleRestartIncorrect}
                          >
                            <ArrowRotateRight className="size-4 text-accent-pink" />
                            Only mistakes ({data.incorrect.length})
                          </Menu.Item>
                        )}
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                )}
              </AnimatePresence>
            </Menu.Root>
          </div>
        </section>
        <section className="mt-6 flex flex-col gap-6">
          {incorrect.length > 0 && (
            <Collapsible.Root defaultOpen>
              <Collapsible.Trigger className="group flex items-center cursor-pointer bg-transparent border-none w-full text-left py-2 relative isolate">
                <span className="z-[1] pr-2 bg-bg-300 relative text-lg text-accent-red flex items-center gap-2">
                  Incorrect ({incorrect.length})
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-text-muted transition-transform group-data-[panel-open]:rotate-180 size-4"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
                <span className="absolute inset-0 top-1/2 h-0.5 -z-[1] bg-accent-red/30" aria-hidden="true" />
              </Collapsible.Trigger>
              <Collapsible.Panel
                keepMounted
                render={(props, state) => {
                  const { hidden, ...rest } = props;
                  return (
                    <motion.div
                      {...(rest as HTMLMotionProps<"div">)}
                      initial={false}
                      animate={{
                        height: state.open ? "auto" : 0,
                        opacity: state.open ? 1 : 0,
                      }}
                      transition={
                        state.open
                          ? { type: "spring", stiffness: 500, damping: 30 }
                          : { type: "spring", stiffness: 500, damping: 40 }
                      }
                      style={{ ...rest.style, overflow: "hidden" }}
                    />
                  );
                }}
              >
                <div
                  className="grid grid-cols-1 gap-y-3 pb-4"
                  style={{ "--clr-accent": "var(--color-accent-red)" } as React.CSSProperties}
                >
                  {incorrect.map((answerData, answerIdx) => (
                    <EndCardList
                      data={answerData}
                      dataClass={dataClass}
                      mode={mode}
                      key={`${JSON.stringify(answerData)}_${answerIdx}`}
                    />
                  ))}
                </div>
              </Collapsible.Panel>
            </Collapsible.Root>
          )}
          {correct.length > 0 && (
            <Collapsible.Root defaultOpen>
              <Collapsible.Trigger className="group flex items-center cursor-pointer bg-transparent border-none w-full text-left py-2 relative isolate">
                <span className="z-[1] pr-2 bg-bg-300 relative text-lg text-accent-green flex items-center gap-2">
                  Correct ({correct.length})
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-text-muted transition-transform group-data-[panel-open]:rotate-180 size-4"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
                <span className="absolute inset-0 top-1/2 h-0.5 -z-[1] bg-accent-green/30" aria-hidden="true" />
              </Collapsible.Trigger>
              <Collapsible.Panel
                keepMounted
                render={(props, state) => {
                  const { hidden, ...rest } = props;
                  return (
                    <motion.div
                      {...(rest as HTMLMotionProps<"div">)}
                      initial={false}
                      animate={{
                        height: state.open ? "auto" : 0,
                        opacity: state.open ? 1 : 0,
                      }}
                      transition={
                        state.open
                          ? { type: "spring", stiffness: 500, damping: 30 }
                          : { type: "spring", stiffness: 500, damping: 40 }
                      }
                      style={{ ...rest.style, overflow: "hidden" }}
                    />
                  );
                }}
              >
                <div
                  className="grid grid-cols-1 gap-y-3 pb-4"
                  style={{ "--clr-accent": "var(--color-accent-green)" } as React.CSSProperties}
                >
                  {correct.map((answerData, answerIdx) => (
                    <EndCardList
                      data={answerData}
                      dataClass={dataClass}
                      mode={mode}
                      key={`${JSON.stringify(answerData)}_${answerIdx}`}
                    />
                  ))}
                </div>
              </Collapsible.Panel>
            </Collapsible.Root>
          )}
        </section>
      </motion.div>
    </LayoutGroup>
  );
};

export default EndCard;
