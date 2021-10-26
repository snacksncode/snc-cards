import classNames from "classnames";
import styles from "./FlipCardButton.module.scss";
import { motion, MotionStyle } from "framer-motion";
import { FC, MouseEventHandler, ReactNode } from "react";

interface Props {
  isMobile: boolean | undefined;
  onClick: MouseEventHandler<HTMLButtonElement>;
  icon: ReactNode;
  position: "left" | "right";
  color: "green" | "red";
}

const FlipCardButton: FC<Props> = ({ isMobile, icon, onClick, position, color }) => {
  const accentColor = color === "green" ? "var(--clr-accent-green)" : "var(--clr-accent-red)";
  const xOffset = position === "left" ? -150 : 150;
  const classes = classNames(styles.container, { [`${styles["container--mobile"]}`]: isMobile });
  return (
    <motion.button
      initial={{ x: 0, right: position === "right" ? 0 : "unset", top: "50%", translateY: "-50%", opacity: 0 }}
      animate={{ x: isMobile ? 0 : xOffset, y: isMobile ? 175 : 0, opacity: 1 }}
      exit={{ x: 0, y: 0, opacity: 0 }}
      style={{ "--clr-accent": accentColor } as MotionStyle}
      transition={{ type: "spring" }}
      whileHover={{ scale: 1.125, transition: { duration: 0.2 } }}
      className={classes}
      onClick={onClick}
    >
      {icon}
    </motion.button>
  );
};

export default FlipCardButton;
