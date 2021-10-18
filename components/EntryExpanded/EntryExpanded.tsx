import getAccentForClass from "@utils/getAccentForClass";
import { IEntryFields } from "contentful-types";
import { motion } from "framer-motion";
import Cards from "icons/Cards";
import Close from "icons/Close";
import Edit from "icons/Edit";
import List from "icons/List";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import styles from "./EntryExpanded.module.scss";

interface Props {
  entry: IEntryFields;
  selectedId: string | null;
  selectEntry: (id: string | null) => void;
}

const EntryExpanded = ({ entry, selectedId, selectEntry }: Props) => {
  const { class: dataClass, data, description, dueDate, slug, title } = entry;
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
          "--clr-card-accent": getAccentForClass(dataClass),
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
        {title}
      </motion.p>

      <p className={styles.date}>
        {new Date(dueDate || 0).toLocaleString("en-US", {
          dateStyle: "full",
        })}
      </p>
      <div className={styles.label}>Description</div>
      <p className={styles.info}>{description || "No description provided"}</p>

      <div className={styles.buttons}>
        <Link href={`${slug}/card`}>
          <a key={slug}>
            <Cards />
            Cards
          </a>
        </Link>

        <Link href={`${slug}/list`}>
          <a key={slug}>
            <List />
            List
          </a>
        </Link>
        {dataClass !== "math" && (
          <Link href={`${slug}/spelling`}>
            <a key={slug} data-new-tag>
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
