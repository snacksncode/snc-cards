import { NextPage } from "next";
import React, { ChangeEventHandler, useEffect, useState } from "react";
import { getData } from "@data/exporter";
import styles from "@styles/Home.module.scss";
import ListEntries from "@components/ListEntries";
import { motion } from "framer-motion";
import Filter from "@components/Filter";

// const ITEMS_PER_PAGE = 4;

interface Props {
  dataArray: Data[];
}

const Home: NextPage<Props> = ({ dataArray }) => {
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
