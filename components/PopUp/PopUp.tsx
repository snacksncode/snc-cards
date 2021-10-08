import { motion } from "framer-motion";
import { PropsWithChildren } from "react";
import styles from "./PopUp.module.scss";

interface Props {}

const PopUp = ({ children }: PropsWithChildren<Props>) => {
  return (
    <motion.div
      role="dialog"
      layout
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.wrapper}
    >
      {children}
    </motion.div>
  );
};

export default PopUp;
