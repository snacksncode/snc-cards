import { InferGetStaticPropsType, NextPage } from "next";
import React, { ChangeEventHandler, useEffect, useState } from "react";
import styles from "@styles/Home.module.scss";
import ListEntries from "@components/ListEntries";
import { motion } from "framer-motion";
import Filter from "@components/Filter";

export const getStaticProps = async () => {
  const rawData = await fetch(`${process.env.API_URL}/cards?populate=questions&sort=updatedAt%3Adesc`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
      "content-type": "application/json",
    },
  });
  let data: ApiResponse = await rawData.json();

  return {
    props: {
      data: data,
    },
    revalidate: 60,
  };
};

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ data: { data, meta: _ } }) => {
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
        Select one of the topics below
      </motion.h1>
      <Filter value={inputValue} onChangeHandler={handleInputChange} />
      <ListEntries filterString={filterString} data={data} />
    </main>
  );
};

export default Home;
