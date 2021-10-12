import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { getData } from "@data/exporter";
import styles from "@styles/Home.module.scss";
import ListEntries from "@components/ListEntries";

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
      <h1>Select the topic that you want to revise</h1>
      <label htmlFor="search">Look for topics</label>
      <div className={styles.field}>
        <input id="search" type="text" value={inputValue} onChange={handleInputChange} />
      </div>
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
