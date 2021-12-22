import classNames from "classnames";
import { motion } from "framer-motion";
import Image from "next/image";
import { AnimationDefinition } from "node_modules/framer-motion/types/render/utils/animation";
import { FC } from "react";
import styles from "./ExpandingBlob.module.scss";

interface Props {
  onAnimationComplete: (a: AnimationDefinition) => void;
  type: "correct" | "wrong";
}

const ExpandingBlob: FC<Props> = ({ type, onAnimationComplete }) => {
  const outerBlobClasses = classNames(styles.outerBlob, {
    [`${styles["outerBlob--red"]}`]: type === "wrong",
    [`${styles["outerBlob--green"]}`]: type === "correct",
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
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          onAnimationComplete={onAnimationComplete}
          className={styles.iconWrapper}
        >
          <Image src={type === "correct" ? "/TickSquare.png" : "/CloseSquare.png"} width={60} height={60} alt={type} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ExpandingBlob;
