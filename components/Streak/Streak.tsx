import { AnimatePresence, motion } from "framer-motion";
import React, { FC, useEffect, useState } from "react";
import styles from "./Streak.module.scss";

interface Props {
  streak: number;
}
const ACTIVATE_AT = 5;

const Streak: FC<Props> = ({ streak }) => {
  const [shouldPulse, setShouldPulse] = useState(false);
  useEffect(() => {
    if (streak > ACTIVATE_AT) {
      setShouldPulse(true);
    }
  }, [streak]);
  return (
    <AnimatePresence>
      {streak >= ACTIVATE_AT && (
        <motion.div
          key="streak"
          initial={{ scale: 0.85, opacity: 0, y: -10 }}
          animate={{ scale: shouldPulse ? 1.125 : 1, opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={styles.wrapper}
        >
          <div className={styles.content}>Streak x{streak} 🔥</div>
          {shouldPulse && (
            <motion.div
              key="pulse"
              className={styles.pulse}
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
