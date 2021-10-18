import getAccentForClass from "@utils/getAccentForClass";
import { IEntryFields } from "additional";
import { motion } from "framer-motion";
import Cards from "icons/Cards";
import Close from "icons/Close";
import Edit from "icons/Edit";
import List from "icons/List";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import styles from "./EntryExpanded.module.scss";

interface Props {
  entry: IEntryFields | undefined;
  selectedId: string | null;
  selectEntry: (id: string | null) => void;
}

const EntryExpanded = ({ entry, selectedId, selectEntry }: Props) => {
  const ref = useRef<null | HTMLDivElement>(null);

  const handleClose = () => {
    selectEntry(null);
  };

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
    <motion.div
      style={
        {
          "--clr-card-accent": getAccentForClass(entry?.class),
        } as any
      }
      ref={ref}
      tabIndex={0}
      className={styles.container}
      layout
      layoutId={`container_${selectedId}`}
    >
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
        onClick={handleClose}
        className={styles.close}
      >
        <Close />
      </motion.button>
      <motion.p layout className={styles.title} layoutId={`title_${selectedId}`}>
        {entry?.title}
      </motion.p>

      <p className={styles.date}>
        {new Date(entry?.dueDate || 0).toLocaleString("en-US", {
          dateStyle: "full",
        })}
      </p>
      <div className={styles.label}>Description</div>
      <p className={styles.info}>{entry?.description || "No description provided"}</p>

      <div className={styles.buttons}>
        <Link href={`${entry?.slug}/card`}>
          <a key={entry?.slug}>
            <Cards />
            Cards
          </a>
        </Link>

        <Link href={`${entry?.slug}/list`}>
          <a key={entry?.slug}>
            <List />
            List
          </a>
        </Link>
        {entry?.class !== "math" && (
          <Link href={`${entry?.slug}/spelling`}>
            <a key={entry?.slug} data-new-tag>
              <Edit />
              Spelling
            </a>
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default EntryExpanded;
