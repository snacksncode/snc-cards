import classNames from "classnames";
import { motion } from "framer-motion";
import React from "react";
import styles from "./Button.module.scss";

interface Props {
  onClick: Function;
  className?: string;
}

const Button = ({ children, onClick, className }: React.PropsWithChildren<Props>) => {
  const classes = classNames(styles.container, {
    [`${className}`]: className != null,
  });
  return (
    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={(e) => onClick(e)} className={classes}>
      {children}
    </motion.button>
  );
};

export default Button;
