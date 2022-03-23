import { motion } from "framer-motion";
import { PropsWithChildren } from "react";
import styles from "./Overlay.module.scss";

interface Props {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Overlay = ({ children, onClick }: PropsWithChildren<Props>) => {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: "easeOut", duration: 0.2 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className={styles.wrapper}
    >
      {children}
    </motion.div>
  );
};

export default Overlay;
