import getAccentForClass from "@utils/getAccentForClass";
import groupBy from "@utils/groupBy";
import classNames from "classnames";
import { motion } from "framer-motion";
import { NoteText, Edit, Category, CloseSquare } from "iconsax-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import ReactFocusLock from "react-focus-lock";
import styles from "./EntryExpanded.module.scss";

interface Props {
  entry: APIData;
  // selectedId: string | null;
  selectEntry: (id: string | null) => void;
}

const EntryExpanded = ({ entry, selectEntry }: Props) => {
  const { class: dataClass, description, dueDate, slug, title } = entry;
  const ref = useRef<null | HTMLDivElement>(null);
  const [dupsData, setDupsData] = useState<QuestionData[][]>();
  const entryDate = new Date(dueDate || 0);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const handleClose: React.MouseEventHandler<HTMLButtonElement> = (_e) => {
    selectEntry(null);
  };

  useEffect(() => {
    if (!entry) return;
    const grouped = groupBy(entry.questionData, (q) => q.question);
    const values = Object.values(grouped);
    const dups = values.filter((v) => v.length > 1);
    if (dups.length > 0) setDupsData(dups);
  }, [entry]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") selectEntry(null);
    };
    window.addEventListener("keydown", handler);
    ref.current?.focus();
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [selectEntry]);

  return (
    <ReactFocusLock>
      <motion.div
        style={
          {
            "--clr-card-accent": getAccentForClass(dataClass),
          } as any
        }
        ref={ref}
        className={styles.container}
        initial={{ scale: 0.85, opacity: 0, y: "-50%", x: "-50%" }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ ease: "backOut" }}
      >
        <button onClick={handleClose} className={styles.close}>
          <CloseSquare size="32" color="currentColor" variant="Bold" />
        </button>
        <p className={styles.title}>{title}</p>

        <p className={styles.date}>
          {entryDate.toLocaleString("en-US", {
            dateStyle: "full",
          })}
          {entryDate < yesterday && <span className={styles.overdue}>Overdue</span>}
        </p>
        <div className={styles.label}>Description</div>
        <p className={styles.info}>{description || "No description provided"}</p>

        {dupsData && (
          <>
            <div className={classNames(styles.label, styles.label__warning)}>Duplicates warning</div>
            <p className={styles.info}>
              Please open <b>list view</b> for more informations
            </p>
          </>
        )}

        <div className={styles.buttons}>
          <Link href={`${slug}/card`}>
            <a key={slug}>
              <Category size="32" color="currentColor" variant="Bold" />
              Cards
            </a>
          </Link>

          <Link href={`${slug}/list`}>
            <a key={slug}>
              <NoteText size="32" color="currentColor" variant="Bold" />
              List
            </a>
          </Link>
          {dataClass !== "math" && (
            <Link href={`${slug}/spelling`}>
              <a key={slug}>
                <Edit size="32" color="currentColor" variant="Bold" />
                Spelling
              </a>
            </Link>
          )}
        </div>
      </motion.div>
    </ReactFocusLock>
  );
};

export default EntryExpanded;
