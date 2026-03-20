"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

const INTRO_DURATION = 2000;
const SCENE_DURATIONS = [10000, 4000, 4000]; // cards, spelling, list
const SCENE_HEIGHT = 280;

// --- Card data for the looping demo ---
const DEMO_CARDS = [
  { front: "Dog?", back: "Hund", verdict: "correct" as const },
  { front: "Cat?", back: "Katze", verdict: "wrong" as const },
];

// Spring definitions copied from the actual FlipCard component
const slideSpring = { type: "spring" as const, stiffness: 120, damping: 20 };
const flipSpring = { type: "spring" as const, stiffness: 200, damping: 20 };
const buttonSpring = { type: "spring" as const };

type CardPhase = "enter" | "flip" | "verdict" | "exit";

// Single card that goes through: enter → flip → verdict → exit
function DemoCard({
  card,
  onDone,
  onPhaseChange,
}: {
  card: (typeof DEMO_CARDS)[number];
  onDone: () => void;
  onPhaseChange: (phase: CardPhase) => void;
}) {
  const [phase, setPhase] = useState<CardPhase>("enter");

  useEffect(() => {
    // ~5.5s per card total (1s reading + flip + verdict + exit)
    const timers = [
      setTimeout(() => setPhase("flip"), 1000),
      setTimeout(() => setPhase("verdict"), 2600),
      setTimeout(() => setPhase("exit"), 4200),
      setTimeout(onDone, 4800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  useEffect(() => {
    onPhaseChange(phase);
  }, [phase, onPhaseChange]);

  const isFlipped = phase !== "enter";
  const showButtons = phase === "flip";
  const isVerdict = phase === "verdict" || phase === "exit";
  const isCorrect = card.verdict === "correct";
  const verdictColor = isCorrect ? "green" : "red";

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ x: 150, opacity: 0, scale: 0.5 }}
      animate={
        phase === "exit"
          ? { x: -150, opacity: 0, scale: 0.5 }
          : { x: 0, opacity: 1, scale: 1 }
      }
      transition={slideSpring}
    >
      {/* Card container with perspective */}
      <div className="relative w-36 h-24" style={{ perspective: "600px" }}>
        {/* Buttons — positioned absolute to card, start behind it, slide out */}
        <AnimatePresence>
          {showButtons && (
            <>
              <motion.div
                className="absolute left-0 top-1/2 text-accent-red z-[-1]"
                initial={{ x: 0, y: "-50%", opacity: 0 }}
                animate={{ x: -60, y: "-50%", opacity: 1 }}
                exit={{ x: 0, y: "-50%", opacity: 0 }}
                transition={buttonSpring}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>
              </motion.div>
              <motion.div
                className="absolute right-0 top-1/2 text-accent-green z-[-1]"
                initial={{ x: 0, y: "-50%", opacity: 0 }}
                animate={{ x: 60, y: "-50%", opacity: 1 }}
                exit={{ x: 0, y: "-50%", opacity: 0 }}
                transition={buttonSpring}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Flipping card */}
        <motion.div
          className="w-full h-full relative"
          animate={{ rotateX: isFlipped ? 180 : 0 }}
          transition={flipSpring}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front — question (blue) */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-lg bg-bg-400 border-[3px] border-accent-blue text-accent-blue font-bold text-lg"
            style={{ backfaceVisibility: "hidden" }}
          >
            {card.front}
          </div>
          {/* Back — answer (peachy, transitions to verdict color) */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-lg bg-bg-400 border-[3px] overflow-hidden text-accent-peachy font-bold text-lg transition-[border-color] duration-200"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateX(180deg)",
              borderColor: isVerdict
                ? `var(--color-accent-${verdictColor})`
                : "var(--color-accent-peachy)",
            }}
          >
            {card.back}
            {/* Expanding blob on verdict */}
            {isVerdict && (
              <>
                <motion.div
                  className={`absolute inset-0 z-[1] ${isCorrect ? "bg-accent-green-darker" : "bg-accent-red-darker"}`}
                  initial={{ clipPath: "circle(0% at center)" }}
                  animate={{ clipPath: "circle(100% at center)" }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div
                  className={`absolute inset-0 z-[2] flex items-center justify-center ${isCorrect ? "bg-accent-green" : "bg-accent-red"}`}
                  initial={{ clipPath: "circle(0% at center)" }}
                  animate={{ clipPath: "circle(100% at center)" }}
                  transition={{ delay: 0.12, duration: 0.3 }}
                >
                  <motion.span
                    className="text-2xl font-bold text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.25, type: "spring", stiffness: 400, damping: 15 }}
                  >
                    {isCorrect ? "✓" : "✗"}
                  </motion.span>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// --- 3D Keyboard Key (matches Filter component's kbd style) ---
function KbdKey({ label, pressed, dimmed }: { label: string; pressed: boolean; dimmed?: boolean }) {
  return (
    <div
      className="bg-bg-500 rounded-sm px-2 py-1 text-xs font-bold text-text-muted select-none transition-[transform,opacity] duration-150"
      style={{
        transform: pressed ? "translateY(3px)" : "translateY(0)",
        boxShadow: pressed ? "0 0px 0px var(--color-bg-300)" : "0 3px 0px var(--color-bg-300)",
        opacity: dimmed ? 0.35 : 1,
      }}
    >
      {label}
    </div>
  );
}

// --- Scene 1: Cards (blue) — loops through DEMO_CARDS ---
function CardsScene() {
  const [cardIndex, setCardIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<CardPhase>("enter");
  const currentCard = DEMO_CARDS[cardIndex];

  const handleDone = useCallback(() => {
    setCardIndex((i) => (i + 1) % DEMO_CARDS.length);
    setCardKey((k) => k + 1);
  }, []);

  const [keyPressed, setKeyPressed] = useState(false);

  const handlePhaseChange = useCallback((phase: CardPhase) => {
    setCurrentPhase(phase);
    if (phase === "flip" || phase === "verdict") {
      setKeyPressed(true);
      setTimeout(() => setKeyPressed(false), 250);
    }
  }, []);

  const PHASE_ORDER: CardPhase[] = ["enter", "flip", "verdict", "exit"];
  const phaseReached = (target: CardPhase) =>
    PHASE_ORDER.indexOf(currentPhase) >= PHASE_ORDER.indexOf(target);
  const isCorrect = currentCard.verdict === "correct";
  const flipPressed = keyPressed && currentPhase === "flip";
  const verdictPressed = keyPressed && currentPhase === "verdict";

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-base font-semibold text-accent-blue m-0">Test yourself with flashcards</p>
      <div className="relative w-full h-36">
        <DemoCard
          key={cardKey}
          card={DEMO_CARDS[cardIndex]}
          onDone={handleDone}
          onPhaseChange={handlePhaseChange}
        />
      </div>
      {/* Keyboard indicator — hidden on mobile */}
      <div className="flex max-lg:hidden items-center justify-center gap-3 h-8">
        <AnimatePresence mode="wait">
          {isCorrect ? (
            <motion.div
              key={`keys-correct-${cardKey}`}
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <KbdKey label="Enter" pressed={flipPressed} dimmed={phaseReached("flip")} />
              <KbdKey label="Enter" pressed={verdictPressed} dimmed={phaseReached("verdict")} />
            </motion.div>
          ) : (
            <motion.div
              key={`keys-wrong-${cardKey}`}
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <KbdKey label="Enter" pressed={flipPressed} dimmed={phaseReached("flip")} />
              <KbdKey label="Backspace" pressed={verdictPressed} dimmed={phaseReached("verdict")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// --- Scene 2: Spelling (green) ---
function SpellingScene() {
  const letters = ["H", "a", "u", "s"];
  const [filledCount, setFilledCount] = useState(0);

  useEffect(() => {
    if (filledCount < letters.length) {
      const timeout = setTimeout(() => setFilledCount((c) => c + 1), 400);
      return () => clearTimeout(timeout);
    }
  }, [filledCount, letters.length]);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-base font-semibold text-accent-green m-0">Spell it out to lock it in</p>
      <div className="flex items-center justify-center gap-3">
        {letters.map((letter, i) => {
          const isFilled = i < filledCount;
          return (
            <motion.div
              key={i}
              className="w-12 h-14 rounded-lg flex items-center justify-center font-bold text-lg border"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                backgroundColor: isFilled ? "var(--color-accent-green)" : "var(--color-bg-600)",
                borderColor: isFilled ? "var(--color-accent-green)" : "var(--color-bg-600)",
                color: isFilled ? "var(--color-bg-400)" : "var(--color-text-muted)",
              }}
              transition={{
                scale: { type: "spring", stiffness: 400, damping: 15, delay: i * 0.1 },
                opacity: { delay: i * 0.1 },
                backgroundColor: { duration: 0.15 },
                borderColor: { duration: 0.15 },
                color: { duration: 0.15 },
              }}
            >
              {isFilled && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.2 }}
                >
                  {letter}
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// --- Scene 3: List (peachy) ---
function ListScene() {
  const rows = [
    { q: "Hund", a: "Dog" },
    { q: "Katze", a: "Cat", duplicate: true },
    { q: "Haus", a: "House" },
    { q: "Katze", a: "Cat", isDup: true },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-base font-semibold text-accent-peachy m-0">See everything. Spot duplicates.</p>
      <div className="flex flex-col gap-2 w-full max-w-[320px]">
        {rows.map((row, i) => (
          <motion.div
            key={i}
            className="flex items-center justify-between bg-bg-600 rounded-lg px-4 py-2.5 text-sm"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: i * 0.15,
            }}
          >
            <span className="text-text font-medium">{row.q}</span>
            <div className="flex items-center gap-2">
              {(row.duplicate || row.isDup) && (
                <motion.span
                  className="text-[10px] px-1.5 py-0.5 rounded bg-accent-peachy/15 text-accent-peachy font-semibold leading-none"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15 + 0.5, type: "spring", stiffness: 300, damping: 15 }}
                >
                  duplicate
                </motion.span>
              )}
              <span className="text-text-muted">{row.a}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// --- Dot/pill colors ---
const DOT_COLORS = [
  { bg: "var(--color-accent-blue)", bgDim: "color-mix(in srgb, var(--color-accent-blue) 30%, transparent)" },
  { bg: "var(--color-accent-green)", bgDim: "color-mix(in srgb, var(--color-accent-green) 30%, transparent)" },
  { bg: "var(--color-accent-peachy)", bgDim: "color-mix(in srgb, var(--color-accent-peachy) 30%, transparent)" },
];

// --- Main Component ---
export default function HowItWorks4({ open = true }: { open?: boolean }) {
  const [showIntro, setShowIntro] = useState(true);
  const [activeScene, setActiveScene] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  // Reset everything when closed
  useEffect(() => {
    if (!open) {
      setShowIntro(true);
      setActiveScene(0);
      setProgressKey((k) => k + 1);
    }
  }, [open]);

  // Intro timer — after INTRO_DURATION, fade out intro and start scenes
  useEffect(() => {
    if (!open || !showIntro) return;
    const t = setTimeout(() => setShowIntro(false), INTRO_DURATION);
    return () => clearTimeout(t);
  }, [open, showIntro]);

  const advance = useCallback(() => {
    setActiveScene((prev) => (prev + 1) % 3);
    setProgressKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!open || showIntro) return;
    const timeout = setTimeout(advance, SCENE_DURATIONS[activeScene]);
    return () => clearTimeout(timeout);
  }, [advance, activeScene, progressKey, open, showIntro]);

  const handleDotClick = (index: number) => {
    setActiveScene(index);
    setProgressKey((k) => k + 1);
  };

  return (
    <div className="px-4 pb-4 overflow-hidden will-change-transform">
      {/* Scene area — relative + absolute scenes prevent layout jumps */}
      <div className="relative contain-layout contain-paint" style={{ height: SCENE_HEIGHT }}>
        {open && (
          <AnimatePresence mode="wait">
            {showIntro ? (
              <motion.div
                key="intro"
                className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-lg font-semibold text-text m-0">3 ways to learn</p>
                <p className="text-sm text-text-muted m-0">Let us show you how it works</p>
                <div className="w-24 h-1 rounded-full bg-bg-600 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-text-muted"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: INTRO_DURATION / 1000, ease: "linear" }}
                  />
                </div>
              </motion.div>
            ) : (
              <>
                {activeScene === 0 && <CardsScene key="cards" />}
                {activeScene === 1 && <SpellingScene key="spelling" />}
                {activeScene === 2 && <ListScene key="list" />}
              </>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Progress pills — hidden during intro */}
      <motion.div
        className="flex items-center justify-center mt-4 h-4"
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {DOT_COLORS.map((colors, i) => {
          const isActive = !showIntro && activeScene === i;
          return (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className="relative cursor-pointer overflow-hidden rounded-full p-1"
              aria-label={`Go to scene ${i + 1}`}
            >
              <motion.div
                animate={{
                  width: isActive ? 40 : 8,
                  height: 8,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="rounded-full overflow-hidden relative"
                style={{ backgroundColor: colors.bgDim }}
              >
                {isActive && (
                  <motion.div
                    key={`progress-${activeScene}-${progressKey}`}
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: colors.bg }}
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: SCENE_DURATIONS[i] / 1000, ease: "linear" }}
                  />
                )}
              </motion.div>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
