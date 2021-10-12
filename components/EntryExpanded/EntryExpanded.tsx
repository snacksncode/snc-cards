import getAccentForClass from "@utils/getAccentForClass";
import { motion } from "framer-motion";
import Cards from "icons/Cards";
import Close from "icons/Close";
import Edit from "icons/Edit";
import List from "icons/List";
import Link from "next/link";
import React from "react";
import styles from "./EntryExpanded.module.scss";

interface Props {
  data: Data;
  selectedId: string | null;
  selectEntry: (id: string | null) => void;
}

const EntryExpanded = ({ data, selectedId, selectEntry }: Props) => {
  const handleClose = () => {
    selectEntry(null);
  };
  return (
    <motion.div
      style={
        {
          "--clr-card-accent": getAccentForClass(data.class),
        } as any
      }
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
        {data.title}
      </motion.p>

      <p className={styles.date}>
        {new Date().toLocaleString("en-US", {
          dateStyle: "long",
          timeStyle: "medium",
        })}
      </p>
      <div className={styles.label}>Description</div>
      <p className={styles.info}>{data.description || "No description provided"}</p>
      {/* 
      <div className={styles.label}>Class</div>
      <p className={styles.info}>Unspecified</p> */}

      <div className={styles.buttons}>
        <Link href={`${data.id}/card`}>
          <a key={data.id}>
            <Cards />
            Cards
          </a>
        </Link>

        <Link href={`${data.id}/list`}>
          <a key={data.id} data-new-tag>
            <List />
            List
          </a>
        </Link>
        <Link href={`${data.id}/spelling`}>
          <a key={data.id} data-new-tag>
            <Edit />
            Spelling
          </a>
        </Link>
      </div>
    </motion.div>
  );
};

export default EntryExpanded;
