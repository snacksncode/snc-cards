import classNames from "classnames";
import { motion } from "framer-motion";
import { AnimationDefinition } from "node_modules/framer-motion/types/render/utils/animation";
import { FC, ReactNode } from "react";
import styles from "./ExpandingBlob.module.scss";

interface Props {
  onAnimationComplete: (a: AnimationDefinition) => void;
  color: "green" | "red";
  icon: ReactNode;
}

const ExpandingBlob: FC<Props> = ({ icon, color, onAnimationComplete }) => {
  const outerBlobClasses = classNames(styles.outerBlob, {
    [`${styles["outerBlob--red"]}`]: color === "red",
    [`${styles["outerBlob--green"]}`]: color === "green",
  });

  return (
    <motion.div
      tabIndex={0}
      className={outerBlobClasses}
      initial={{ clipPath: "circle(0% at center)" }}
      animate={{ clipPath: "circle(100% at center)" }}
      transition={{ duration: 0.75 }}
    >
      <motion.div
        className={styles.innerBlob}
        initial={{ clipPath: "circle(0% at center)" }}
        animate={{ clipPath: "circle(100% at center)" }}
        transition={{ delay: 0.25, duration: 0.5 }}
        onAnimationComplete={onAnimationComplete}
      >
        <motion.span
          className={styles.iconWrapper}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {icon}
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

export default ExpandingBlob;
