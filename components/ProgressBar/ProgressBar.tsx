import { animate, motion } from "motion/react";
import { useEffect, useRef } from "react";
import Streak from "@components/Streak";

interface Props {
  maxAmount: number;
  currentAmount: number;
  streak: number;
  accentColor: string;
}

const ProgressBar: React.FC<Props> = ({ currentAmount, maxAmount, streak, accentColor }) => {
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
    <div className="fixed top-4 left-4 w-[calc(100%-2rem)] flex flex-col items-center justify-center">
      <div className="w-full max-w-[450px] h-[25px] rounded flex relative overflow-hidden border border-bg-400 shadow-[0_0_7px_rgba(0,0,0,0.15)]">
        <motion.div
          style={{ backgroundColor: accentColor }}
          animate={{ width: `${(currentAmount / maxAmount) * 100}%` }}
          transition={{ ease: "easeInOut" }}
        >
          <p className="m-0 select-none w-[7ch] text-center text-[0.5rem] font-bold tracking-[0.08em] absolute px-1 py-0.5 rounded-sm top-1/2 left-1/2 mix-blend-difference -translate-x-1/2 -translate-y-1/2 text-text-muted">
            <span ref={percentageRef}>0.00%</span>
          </p>
        </motion.div>
      </div>
      <Streak streak={streak} />
    </div>
  );
};

export default ProgressBar;
