import getAccentForClass from "@utils/getAccentForClass";
import groupBy from "@utils/groupBy";
import { motion } from "framer-motion";
import Danger from "icons/Danger";
import { KeyboardEventHandler, MouseEvent, useEffect, useState } from "react";
import styles from "./EntryCollapsed.module.scss";

interface Props {
  entry: APIData;
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

const EntryCollapsed = ({ entry, onSelect, selectedId, entryIndex }: Props) => {
  const [dupsData, setDupsData] = useState<QuestionData[][]>();
  const handleSelect = (_e: MouseEvent<HTMLDivElement>) => {
    onSelect(entry.slug);
  };
  const handleKeypress: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const target = e.target as HTMLDivElement;
      target.click();
      target.blur();
    }
  };
  useEffect(() => {
    if (!entry) return;
    const grouped = groupBy(entry.questionData, (q) => q.question);
    const values = Object.values(grouped);
    const dups = values.filter((v) => v.length > 1);
    if (dups.length > 0) setDupsData(dups);
  }, [entry]);
  return (
    <motion.div
      layout
      tabIndex={selectedId ? -1 : 0}
      onKeyPress={handleKeypress}
      initial={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.03 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * (entryIndex + 1) + 0.125 } }}
      exit={{ opacity: 0 }}
      className={styles.container}
      style={{ "--clr-card-accent": getAccentForClass(entry.class) } as any}
      layoutId={`container_${entry.slug}`}
      onClick={handleSelect}
    >
      <Fade />
      <EntryIcon />
      <motion.p
        layout={selectedId ? true : "position"}
        layoutId={`title_${entry.slug}`}
        className={styles.title}
        style={{ display: "block" }}
      >
        {entry.title}
      </motion.p>
      {dupsData && (
        <span className={styles.dupWarningIcon}>
          <Danger />
        </span>
      )}
      <WordsCount amount={entry.questionData.length} />
    </motion.div>
  );
};

export default EntryCollapsed;
