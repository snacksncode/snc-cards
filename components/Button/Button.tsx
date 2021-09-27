import { motion } from "framer-motion";
import React from "react";
import styles from "./Button.module.scss";

interface Props {
  isVisible?: boolean;
  onClick: Function;
}

const Button = ({ isVisible, children, onClick }: React.PropsWithChildren<Props>) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      onClick={(e) => onClick(e)}
      className={styles.container}
    >
      {children}
    </motion.button>
  );
};

export default Button;
