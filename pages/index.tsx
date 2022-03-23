import { InferGetStaticPropsType, NextPage } from "next";
import React, { ChangeEventHandler, useEffect, useState } from "react";
import styles from "@styles/Home.module.scss";
import ListEntries from "@components/ListEntries";
import { motion } from "framer-motion";
import Filter from "@components/Filter";

export const getStaticProps = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  const rawData = await fetch(`${apiUrl}/entries`);
  let data: APIData[] = await rawData.json();
  data.sort((a, b) => {
    return Math.abs(Date.now() - new Date(a.dueDate).getTime()) - Math.abs(Date.now() - new Date(b.dueDate).getTime());
  });
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
      <motion.h1 initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={styles.heading}>
        Hi! Select the topic that you want to revise
      </motion.h1>
      <Filter value={inputValue} onChangeHandler={handleInputChange} />
      <ListEntries filterString={filterString} entries={data} />
    </main>
  );
};

export default Home;
