import { motion } from "framer-motion";
import React, { useState } from "react";
import Back from "../Back";
import Front from "../Front";
import styles from "./FlipCard.module.scss";

const variants = {
  unflipped: { transform: "rotateX(0deg)" },
  flipped: { transform: "rotateX(180deg)" },
};

interface Data {
  question: string;
  answer: string;
}

interface Props {
  data: Data;
}

const FlipCard = ({ data }: Props) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipCard = () => setIsFlipped((f) => !f);
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={flipCard}
      className={styles.wrapper}
    >
      <motion.div
        variants={variants}
        initial="unflipped"
        transition={{ type: "spring", stiffness: 100 }}
        animate={isFlipped ? "flipped" : "unflipped"}
        className={styles.content}
      >
        <div className={styles.front}>
          <Front data={data.question} />
        </div>
        <div className={styles.back}>
          <Back data={data.answer} />
        </div>
      </motion.div>
    </motion.main>
  );
};

export default FlipCard;
