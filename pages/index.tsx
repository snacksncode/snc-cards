import { InferGetStaticPropsType, NextPage } from "next";
import React, { ChangeEventHandler, useEffect, useRef, useState } from "react";
import styles from "@styles/Home.module.scss";
import ListEntries from "@components/ListEntries";
import { motion } from "framer-motion";
import Filter from "@components/Filter";
import { createClient, EntryCollection } from "contentful";
import { IEntry, IEntryFields } from "contentful-types";

export const getStaticProps = async () => {
  const client = createClient({
    space: process.env.CF_SPACE_ID || "",
    accessToken: process.env.CF_ACCESS_TOKEN || "",
  });
  const res = (await client.getEntries({
    content_type: "entryData",
  })) as EntryCollection<IEntryFields>;
  const data = res.items as IEntry[];
  return {
    props: {
      data,
    },
    revalidate: 60,
  };
};

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ data }) => {
  const [inputValue, setInputValue] = useState("");
  const [filterString, setFilterString] = useState<string | null>(null);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    const TIMEOUT_MS = inputValue.length === 0 ? 0 : 400;
    const timeoutId = window.setTimeout(() => {
      setFilterString(inputValue);
    }, TIMEOUT_MS);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [inputValue]);

  return (
    <main className={styles.wrapper}>
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={styles.heading}>
        Hi! Select the topic that you want to revise
      </motion.h1>
      <Filter value={inputValue} onChangeHandler={handleInputChange} />
      <ListEntries filterString={filterString} entries={data} />
    </main>
  );
};

export default Home;
