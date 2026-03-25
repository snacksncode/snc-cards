"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@components/Button";
import FlipCard from "@components/FlipCard";
import SpellingByWord from "@components/SpellingByWord";
import type { Question } from "@/types";

// --- Demo data ---
const DEMO_CARDS: Question[] = [
  { id: 100, question: "Dog", answer: "der Hund" },
  { id: 101, question: "Cat", answer: "die Katze" },
];
const SPELLING_DEMO: Question = { id: 1, question: "House", answer: "das Haus" };

const LS_KEY = "tutorial-completed";

// --- Step definitions ---
type StepType = "intertitle-cards" | "cards" | "intertitle-spelling" | "spelling" | "end";

interface StepDef {
  type: StepType;
  height: number;
}

const STEPS: StepDef[] = [
  { type: "intertitle-cards", height: 250 },
  { type: "cards", height: 420 },
  { type: "intertitle-spelling", height: 250 },
  { type: "spelling", height: 420 },
  { type: "end", height: 250 },
];

// --- Accent colors for the 2 modes ---
const SCENE_COLORS = [
  { accent: "var(--color-accent-blue)" },
  { accent: "var(--color-accent-green)" },
];

// --- 3D Keyboard Key (display only) ---
function KbdKey({ label }: { label: string }) {
  return (
    <div
      className="bg-bg-500 rounded-sm px-2 py-1 text-xs font-bold text-text-muted select-none"
      style={{ boxShadow: "0 3px 0px var(--color-bg-300)" }}
    >
      {label}
    </div>
  );
}

// --- Intertitle Card ---
function IntertitleCard({
  stepNumber,
  totalSteps,
  title,
  subtitle,
  accentColor,
  onContinue,
}: {
  stepNumber: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  accentColor: string;
  onContinue: () => void;
}) {
  return (
    <motion.div
      ref={(node) => node?.focus()}
      tabIndex={-1}
      onKeyDown={(e) => e.key === "Enter" && onContinue()}
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4"
      style={{ outline: "none" }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-xs font-semibold tracking-widest uppercase text-text-muted m-0">
        Step {stepNumber} of {totalSteps}
      </p>
      <p className="text-2xl font-bold m-0" style={{ color: accentColor }}>
        {title}
      </p>
      <p className="text-sm text-text-muted m-0 text-center max-w-[300px]">
        {subtitle}
      </p>
      <Button variant="ghost" accent={accentColor} onClick={onContinue} className="mt-2">
        Try it out
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Button>
    </motion.div>
  );
}

// --- Interactive Card Scene (2 real FlipCards sequentially) ---
function InteractiveCardScene({ onComplete }: { onComplete: () => void }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleAnswer = (_rightAnswer: boolean, _question: Question) => {
    if (cardIndex < DEMO_CARDS.length - 1) {
      setTimeout(() => {
        setCardIndex((i) => i + 1);
        setCardKey((k) => k + 1);
        setIsFlipped(false);
      }, 400);
    } else {
      setTimeout(onComplete, 400);
    }
  };

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Crossfading prompt text — prominent */}
      <div className="h-14 flex items-center justify-center mt-3">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.p
              key="prompt-question"
              className="text-xl font-semibold text-accent-blue m-0 text-center"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              How do you say this in German?
            </motion.p>
          ) : (
            <motion.p
              key="prompt-verdict"
              className="text-xl font-semibold text-accent-peachy m-0 text-center"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              Did you know it?
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Real FlipCard — scaled down to fit tutorial panel */}
      <div
        className="relative w-full flex-1"
        style={{ transform: "scale(0.8)", transformOrigin: "center center" }}
      >
        <AnimatePresence>
          <FlipCard
            key={cardKey}
            dataClass="de"
            data={DEMO_CARDS[cardIndex]}
            onAnswer={handleAnswer}
            onFlipChange={setIsFlipped}
          />
        </AnimatePresence>
      </div>

      {/* Contextual keyboard hints — desktop only */}
      <div className="max-lg:hidden flex items-center justify-center gap-4 pb-3 text-xs text-text-muted h-8">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="kbd-flip"
              className="flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <KbdKey label="Enter" />
              <span>flip card</span>
            </motion.div>
          ) : (
            <motion.div
              key="kbd-verdict"
              className="flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center gap-1.5">
                <KbdKey label="Enter" />
                <span className="text-accent-green">correct</span>
              </div>
              <div className="flex items-center gap-1.5">
                <KbdKey label="Backspace" />
                <span className="text-accent-red">wrong</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// --- Interactive Spelling Scene ---
function InteractiveSpellingScene({ onComplete }: { onComplete: () => void }) {
  const [showingCorrection, setShowingCorrection] = useState(false);

  const handleAnswer = (_right: boolean, _input: string, _expected: string, _data: Question) => {
    setTimeout(onComplete, 1200);
  };

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Prompt title */}
      <div className="h-14 flex items-center justify-center mt-3">
        <p className="text-xl font-semibold text-accent-green m-0 text-center">
          How do you spell this in German?
        </p>
      </div>

      {/* Real SpellingByWord — scaled down */}
      <div
        className="relative w-full flex-1"
        style={{ transform: "scale(0.8)", transformOrigin: "center center" }}
      >
        <SpellingByWord
          key="tutorial-spelling"
          data={SPELLING_DEMO}
          onAnswer={handleAnswer}
          onWrongAnswer={() => setShowingCorrection(true)}
        />
      </div>

      {/* Crossfading keyboard hint — desktop only */}
      <div className="max-lg:hidden flex items-center justify-center gap-4 pb-3 text-xs text-text-muted h-8">
        <AnimatePresence mode="wait">
          {showingCorrection ? (
            <motion.div
              key="kbd-continue"
              className="flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <KbdKey label="Enter" />
              <span className="text-accent-green">continue</span>
            </motion.div>
          ) : (
            <motion.div
              key="kbd-check"
              className="flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <KbdKey label="Enter" />
              <span>check answer</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// --- End Screen ---
function EndScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-xl font-bold text-text m-0">You&apos;re ready!</p>
      <p className="text-sm text-text-muted m-0 text-center">
        Pick a topic below to start learning.
      </p>
      <Button
        variant="solid"
        accent="var(--color-accent-gold)"
        onClick={() => {
          localStorage.setItem(LS_KEY, "true");
          onComplete();
        }}
        className="mt-2"
      >
        Got it
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Button>
    </motion.div>
  );
}

// --- Main Component ---
export default function HowItWorksInteractive({
  open = true,
  onComplete,
}: {
  open?: boolean;
  onComplete?: () => void;
}) {
  const [step, setStep] = useState(0);

  const advance = () => {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleComplete = () => {
    localStorage.setItem(LS_KEY, "true");
    onComplete?.();
  };

  // Reset to beginning when collapsible is reopened
  const prevOpen = useRef(open);
  if (open && !prevOpen.current) {
    setStep(0);
  }
  prevOpen.current = open;

  const currentStep = STEPS[step];

  return (
    <div className="px-4 pb-4 overflow-hidden">
      <div
        className="relative"
        style={{ height: 452 }}
      >
        {open && (
          <AnimatePresence mode="wait">
            {currentStep.type === "intertitle-cards" && (
              <IntertitleCard
                key="intertitle-cards"
                stepNumber={1}
                totalSteps={2}
                title="Flashcards"
                subtitle="See the question, tap to flip the card, then mark if you knew the answer."
                accentColor={SCENE_COLORS[0].accent}
                onContinue={advance}
              />
            )}

            {currentStep.type === "cards" && (
              <InteractiveCardScene
                key="scene-cards"
                onComplete={advance}
              />
            )}

            {currentStep.type === "intertitle-spelling" && (
              <IntertitleCard
                key="intertitle-spelling"
                stepNumber={2}
                totalSteps={2}
                title="Spelling"
                subtitle="Type out the answer to lock it into memory. Each letter counts!"
                accentColor={SCENE_COLORS[1].accent}
                onContinue={advance}
              />
            )}

            {currentStep.type === "spelling" && (
              <InteractiveSpellingScene
                key="scene-spelling"
                onComplete={advance}
              />
            )}

            {currentStep.type === "end" && (
              <EndScreen
                key="end-screen"
                onComplete={handleComplete}
              />
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
