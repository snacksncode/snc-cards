import { NextPage } from "next";
import Link from "next/link";
import Fuse from "fuse.js";
import React, { useRef, useState } from "react";
import { getData } from "@data/exporter";
import styles from "@styles/Home.module.scss";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  dataObject: {
    data: any[];
    id: string;
    tags: string[];
    lang: string;
  }[];
}

const Home: NextPage<Props> = ({ dataObject }) => {
  const [filteredData, setFilteredData] = useState(dataObject);
  const fuse = useRef(
    new Fuse(dataObject, {
      shouldSort: false,
      keys: [
        {
          name: "id",
          weight: 0.5,
        },
        {
          name: "tags",
          weight: 0.5,
        },
        {
          name: "lang",
          weight: 0.25,
        },
      ],
    })
  );
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    filter(e.target.value);
  };

  const filter = (filterString: string) => {
    if (!filterString) {
      setFilteredData(dataObject);
      return;
    }
    const data = fuse.current.search(filterString);
    setFilteredData(data as any);
  };

  return (
    <main className={styles.wrapper}>
      <h1>Select the topic that you want to revise</h1>
      <label htmlFor="search">Look for topics</label>
      <input id="search" type="text" value={inputValue} onChange={handleInputChange} />
      <div className={styles.grid}>
        <AnimatePresence>
          {filteredData.map((d: any) => {
            const entryData = d.item ? d.item : d;
            return (
              <motion.div key={entryData.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Link key={entryData.id} href={`card/${entryData.id}`}>
                  <a style={{ display: "block" }}>Go to: {entryData.id}</a>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </main>
  );
};

export async function getStaticProps() {
  const data = await getData();
  return {
    props: {
      dataObject: data,
    },
  };
}

export default Home;
