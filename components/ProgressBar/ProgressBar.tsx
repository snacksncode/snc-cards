import styles from "./ProgressBar.module.scss";
import { animate, motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface Props {
  maxAmount: number;
  currentAmount: number;
}

const ProgressBar: React.FC<Props> = ({ currentAmount, maxAmount }) => {
  const percentageRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const node = percentageRef.current;
    if (!node) return;
    const percentageBefore = (Math.max(currentAmount - 1, 0) / maxAmount) * 100;
    const percentageCurrent = (currentAmount / maxAmount) * 100;

    const controls = animate(percentageBefore, percentageCurrent, {
      onUpdate: (value) => {
        node.textContent = `${value.toFixed(2)}%`;
      },
    });
    return () => controls.stop();
  });

  return (
    <div className={styles.progress}>
      <div className={styles.bar}>
        <motion.div
          className={styles.bar__fill}
          animate={{ width: `${(currentAmount / maxAmount) * 100}%` }}
          transition={{ ease: "easeInOut" }}
        >
          <p className={styles.percentage}>
            <span ref={percentageRef}>0.00%</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressBar;
