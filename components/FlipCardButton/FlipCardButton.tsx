import { cn } from "@lib/cn";
import { motion, type MotionStyle } from "motion/react";
import { FC, MouseEventHandler, ReactNode } from "react";

interface Props {
  isMobile: boolean | undefined;
  onClick: MouseEventHandler<HTMLButtonElement>;
  icon: ReactNode;
  position: "left" | "right";
  color: "green" | "red";
}

const FlipCardButton: FC<Props> = ({ isMobile, icon, onClick, position, color }) => {
  const accentColor = color === "green" ? "var(--color-accent-green)" : "var(--color-accent-red)";
  const xOffset = position === "left" ? -150 : 150;
  return (
    <motion.button
      initial={{ x: 0, right: position === "right" ? 0 : "unset", top: "50%", translateY: "-50%", opacity: 0 }}
      animate={{ x: isMobile ? 0 : xOffset, y: isMobile ? 175 : 0, opacity: 1 }}
      exit={{ x: 0, y: 0, opacity: 0 }}
      style={{ "--clr-accent": accentColor } as MotionStyle}
      transition={{ type: "spring" }}
      whileHover={{ scale: 1.125, transition: { duration: 0.2 } }}
      className={cn(
        "absolute bg-[var(--clr-accent)]/8 border-none cursor-pointer px-6 py-0 rounded text-[var(--clr-accent)] [&_svg]:w-[75px] [&_svg]:h-[75px] focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[var(--clr-accent)] focus-visible:outline-offset-[0.5rem]",
        { "w-1/2 [&_svg]:w-[60px] [&_svg]:h-[60px]": isMobile }
      )}
      onClick={onClick}
    >
      {icon}
    </motion.button>
  );
};

export default FlipCardButton;
