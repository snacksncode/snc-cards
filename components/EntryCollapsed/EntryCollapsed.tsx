import getAccentForClass from "@utils/getAccentForClass";
import { motion } from "framer-motion";
import { KeyboardEventHandler, MouseEvent } from "react";
import styles from "./EntryCollapsed.module.scss";

interface Props {
  data: Data;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  entryIndex: number;
}

const Fade = () => {
  return <div className={styles.fade} />;
};

const EntryIcon = () => {
  return <motion.div layout className={styles.icon}></motion.div>;
};

const WordsCount = ({ amount }: { amount: number }) => {
  return <div className={styles.count}>{amount}</div>;
};

const EntryCollapsed = ({ data, onSelect, selectedId, entryIndex }: Props) => {
  const handleSelect = (_e: MouseEvent<HTMLDivElement>) => {
    onSelect(data.id);
  };
  const handleKeypress: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const target = e.target as HTMLDivElement;
      target.click();
      target.blur();
    }
  };
  return (
    <motion.div
      layout
      tabIndex={selectedId ? -1 : 0}
      onKeyPress={handleKeypress}
      initial={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.03 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * (entryIndex + 1) } }}
      exit={{ opacity: 0 }}
      className={styles.container}
      style={{ "--clr-card-accent": getAccentForClass(data.class) } as any}
      layoutId={`container_${data.id}`}
      onClick={handleSelect}
    >
      <Fade />
      <EntryIcon />
      <motion.p
        layout={selectedId ? true : "position"}
        layoutId={`title_${data.id}`}
        className={styles.title}
        style={{ display: "block" }}
      >
        {data.title}
      </motion.p>
      <WordsCount amount={data.data.length} />
    </motion.div>
  );
};

export default EntryCollapsed;
