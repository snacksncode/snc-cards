import { motion } from "framer-motion";
import { ChangeEventHandler, useEffect, useRef } from "react";
import styles from "./Filter.module.scss";

interface Props {
  value: string;
  onChangeHandler: ChangeEventHandler<HTMLInputElement>;
}

const Filter = ({ value, onChangeHandler }: Props) => {
  const inputRef = useRef<null | HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault(); // prevent browser shortcut
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
      className={styles.field}
    >
      <label htmlFor="search">Filter topics</label>
      <div className={styles.input__wrapper}>
        <input
          ref={inputRef}
          id="search"
          type="text"
          placeholder="Search for title"
          value={value}
          onChange={onChangeHandler}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: value.length === 0 ? 1 : 0 }}
          className={styles.keyboard__indicator}
        >
          <div className={styles.key}>Ctrl</div>
          <div className={styles.key}>K</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Filter;
