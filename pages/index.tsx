import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { getData } from "@data/exporter";
import styles from "@styles/Home.module.scss";
import ListEntries from "@components/ListEntries";
import { motion } from "framer-motion";

// const ITEMS_PER_PAGE = 4;

interface Props {
  dataArray: Data[];
}

const Home: NextPage<Props> = ({ dataArray }) => {
  const [inputValue, setInputValue] = useState("");
  const [filterString, setFilterString] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className={styles.field}
      >
        <label htmlFor="search">Filter topics</label>
        <input
          id="search"
          type="text"
          placeholder="...by name & tags"
          value={inputValue}
          onChange={handleInputChange}
        />
      </motion.div>
      <ListEntries filterString={filterString} dataArray={dataArray} />
    </main>
  );
};

export async function getStaticProps() {
  const data = await getData();
  return {
    props: {
      dataArray: data,
    },
  };
}

export default Home;
