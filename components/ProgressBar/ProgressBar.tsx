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
  }, [currentAmount, maxAmount]);

  return (
    <div className="fixed top-4 left-4 w-[calc(100%-2rem)] flex flex-col items-center justify-center">
      <div className="w-full max-w-[450px] relative">
        <p className="m-0 select-none text-center text-[0.65rem] font-mono font-bold text-text-muted mb-1">
          <span ref={percentageRef}>0.00%</span>
        </p>
        <div className="w-full h-2 rounded-full bg-bg-500 overflow-hidden">
          <motion.div
            style={{
              backgroundColor: accentColor,
              filter: `drop-shadow(0 0 8px ${accentColor})`,
              transformOrigin: "left",
            }}
            className="w-full h-full rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: currentAmount / maxAmount }}
            transition={{ ease: "easeInOut", duration: 0.4 }}
          />
        </div>
      </div>
      <Streak streak={streak} />
    </div>
  );
};

export default ProgressBar;
