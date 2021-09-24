import type { NextPage } from "next";
import styles from "@styles/Home.module.scss";
import FlipCard from "../components/FlipCard";
import wordsData from "../data/irregular";
import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import shuffle from "../utils/shuffle";

const Home: NextPage = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  let [data, setData] = useState<any[] | null>(null);
  useEffect(() => {
    setData(shuffle(wordsData));
  }, []);
  return (
    <div className={styles.container}>
      <AnimatePresence exitBeforeEnter>
        {data &&
          data.map((d, i) => {
            {
              return selectedIndex === i && <FlipCard key={i} data={d} />;
            }
          })}
      </AnimatePresence>
      <button onClick={() => setSelectedIndex((i) => i + 1)}>Next</button>
    </div>
  );
};

export default Home;
