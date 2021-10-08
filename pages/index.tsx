import { NextPage } from "next";
import Link from "next/link";
import Fuse from "fuse.js";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getData } from "@data/exporter";
import styles from "@styles/Home.module.scss";
import { AnimatePresence, motion, AnimateSharedLayout } from "framer-motion";
import PopUp from "@components/PopUp";
import { convertFileData } from "@utils/convertFileData";

// const ITEMS_PER_PAGE = 4;

interface Props {
  dataObject: Data[];
}

const Home: NextPage<Props> = ({ dataObject }) => {
  const [filteredData, setFilteredData] = useState<Data[] | Fuse.FuseResult<Data>[]>(dataObject);
  // const [page, setPage] = useState(1);
  const [showPopUp, setShowPopUp] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const fileData = await file.text();
    const converted = convertFileData(fileData);
    console.log(converted);
  };
  const fuse = useRef(
    new Fuse(dataObject, {
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
  };

  const filter = useCallback(
    (filterString: string) => {
      if (!filterString) {
        setFilteredData(dataObject);
        return;
      }
      const data = fuse.current.search(filterString);
      setFilteredData(data);
    },
    [dataObject]
  );

  useEffect(() => {
    const TIMEOUT_MS = inputValue.length === 0 ? 0 : 250;
    const timeoutId = window.setTimeout(() => {
      filter(inputValue);
    }, TIMEOUT_MS);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [inputValue, filter]);

  return (
    <main className={styles.wrapper}>
      <h1>Select the topic that you want to revise</h1>
      <label htmlFor="search">Look for topics</label>
      <div className={styles.field}>
        <input id="search" type="text" value={inputValue} onChange={handleInputChange} />
      </div>
      <AnimateSharedLayout type="crossfade">
        <motion.div className={styles.grid}>
          <AnimatePresence>
            {filteredData.map((d) => {
              const entryData = (d as Fuse.FuseResult<Data>).item ? (d as Fuse.FuseResult<Data>).item : (d as Data);
              return (
                <motion.div
                  layout
                  key={entryData.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={styles.entry}
                  layoutId={`container_${entryData.id}`}
                  onClick={() => setSelectedEntryId(entryData.id)}
                >
                  {/* <Link passHref={true} key={entryData.id} href={`${entryData.id}/card`}> */}
                  <motion.p
                    layout={selectedEntryId === entryData.id ? true : "position"}
                    layoutId={`title_${entryData.id}`}
                    className={styles.entry__title}
                    style={{ display: "block" }}
                  >
                    {entryData.id}
                  </motion.p>
                  {/* </Link> */}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
        <AnimatePresence>
          {selectedEntryId && (
            <>
              <PopUp />
              <motion.div className={styles.expanded} layout layoutId={`container_${selectedEntryId}`}>
                <motion.p className={styles.expanded__title} layout layoutId={`title_${selectedEntryId}`}>
                  {dataObject.find((d) => d.id === selectedEntryId)?.id}
                </motion.p>
                <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nesciunt at temporibus ullam aperiam alias
                  fugiat itaque. Dicta commodi adipisci officia.
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.35 } }}
                  onClick={() => setSelectedEntryId(null)}
                >
                  Close
                </motion.button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </AnimateSharedLayout>
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
