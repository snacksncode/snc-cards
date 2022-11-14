import getAccentForClass from "@utils/getAccentForClass";
import getHumanReadableClass from "@utils/getHumanReadableClass";
import groupBy from "@utils/groupBy";
import { motion } from "framer-motion";
import { Danger } from "iconsax-react";
import { FC, KeyboardEventHandler, MouseEvent, PropsWithChildren, useEffect, useState } from "react";
import styles from "./EntryCollapsed.module.scss";

interface Props {
  entry: APIData;
  onSelect: (id: string | null) => void;
  entryDelay: number;
}

const Fade = () => {
  return <div className={styles.fade} />;
};

const Tag: FC<PropsWithChildren> = ({ children }) => {
  return <div className={styles.tag}>{children}</div>;
};

const EntryCollapsed = ({ entry, onSelect, entryDelay }: Props) => {
  const [dupsData, setDupsData] = useState<QuestionData[][]>();
  const dueDate = new Date(entry.dueDate);
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
      onKeyPress={handleKeypress}
      initial={{ y: -25, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: entryDelay } }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.03 }}
      className={styles.container}
      style={{ "--clr-card-accent": getAccentForClass(entry.class) } as any}
      onClick={handleSelect}
      tabIndex={0}
    >
      <Fade />
      {dupsData && (
        <span style={{ marginLeft: "auto" }} className={styles.dupWarningIcon}>
          <Danger size="1em" color="currentColor" variant="Bold" />
        </span>
      )}
      <p className={styles.bang}>TITLE</p>
      <h1 className={styles.title}>{entry.title}</h1>
      <div className={styles.tags}>
        <Tag>{getHumanReadableClass(entry.class)}</Tag>
        <Tag>{dueDate.toLocaleDateString("en-US", { day: "2-digit", weekday: "short", month: "short" })}</Tag>
        <Tag>{entry.questionData.length} words</Tag>
      </div>
      {/* <WordsCount amount={entry.questionData.length} /> */}
    </motion.div>
  );
};

export default EntryCollapsed;
