import { cn } from "@lib/cn";
import { motion } from "motion/react";
import Image from "next/image";
import { FC } from "react";

interface Props {
  onAnimationComplete: () => void;
  type: "correct" | "wrong";
}

const ExpandingBlob: FC<Props> = ({ type, onAnimationComplete }) => {
  return (
    <motion.div
      tabIndex={0}
      className={cn(
        "z-2 absolute top-0 left-0 w-full h-full",
        type === "wrong" ? "bg-accent-red-darker" : "bg-accent-green-darker"
      )}
      initial={{ clipPath: "circle(0% at center)" }}
      animate={{ clipPath: "circle(100% at center)" }}
      transition={{ duration: 0.75 }}
    >
      <motion.div
        className={cn(
          "z-2 absolute top-0 left-0 w-full h-full flex items-center justify-center",
          type === "wrong" ? "bg-accent-red" : "bg-accent-green"
        )}
        initial={{ clipPath: "circle(0% at center)" }}
        animate={{ clipPath: "circle(100% at center)" }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          onAnimationComplete={onAnimationComplete}
          className="w-[60px] h-[60px]"
        >
          <Image src={type === "correct" ? "/TickSquare.png" : "/CloseSquare.png"} width={60} height={60} alt={type} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ExpandingBlob;
