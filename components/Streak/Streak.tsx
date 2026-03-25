import { getStreakEmojis } from "@lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { FC, useRef, useState } from "react";

interface Props {
  streak: number;
}
const ACTIVATE_AT = 5;

const Streak: FC<Props> = ({ streak }) => {
  const [shouldPulse, setShouldPulse] = useState(false);
  const prevStreak = useRef(streak);

  // Trigger pulse when streak increases past threshold (no useEffect needed)
  if (streak > ACTIVATE_AT && streak !== prevStreak.current) {
    prevStreak.current = streak;
    if (!shouldPulse) setShouldPulse(true);
  }
  prevStreak.current = streak;

  return (
    <AnimatePresence>
      {streak >= ACTIVATE_AT && (
        <motion.div
          key="streak"
          initial={{ scale: 0.85, opacity: 0, y: -10 }}
          animate={{ scale: shouldPulse ? 1.125 : 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }}
          exit={{ opacity: 0 }}
          className="mt-4 w-fit text-center text-[0.75em] font-medium relative isolate z-[1] rounded border-2 border-accent-peachy text-accent-peachy flex"
        >
          <div className="px-5 py-1 relative z-[1] bg-bg-300">
            Streak x{streak} {getStreakEmojis(streak)}
          </div>
          {shouldPulse && (
            <motion.div
              key="pulse"
              className="absolute -z-[1] bg-accent-peachy top-1/2 left-1/2 rounded-full h-full aspect-square"
              initial={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.4, ease: "linear" }}
              onAnimationComplete={() => setShouldPulse(false)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Streak;
