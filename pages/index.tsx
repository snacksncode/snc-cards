import { NextPage } from "next";
import Link from "next/link";
import Fuse from "fuse.js";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getData } from "@data/exporter";
import styles from "@styles/Home.module.scss";
import { AnimatePresence, motion, AnimateSharedLayout } from "framer-motion";
import Overlay from "@components/Overlay";
// import { convertFileData } from "@utils/convertFileData";
import Close from "icons/Close";
import getAccentForClass from "@utils/getAccentForClass";
import Cards from "icons/Cards";
import List from "icons/List";
import Edit from "icons/Edit";
import useBlockScrolling from "@utils/useBlockScrolling";

// const ITEMS_PER_PAGE = 4;

interface Props {
  dataObject: Data[];
}

const Home: NextPage<Props> = ({ dataObject }) => {
  const [filteredData, setFilteredData] = useState<Data[] | Fuse.FuseResult<Data>[]>(dataObject);
  const blockScrolling = useBlockScrolling();
  // const [page, setPage] = useState(1);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const selectedObject = selectedEntryId ? (dataObject.find((d) => d.id === selectedEntryId) as Data) : null;

  // const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!e.target.files) return;
  //   const file = e.target.files[0];
  //   const fileData = await file.text();
  //   const converted = convertFileData(fileData);
  // };
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
    const shouldBlock = selectedEntryId == null ? false : true;
    blockScrolling(shouldBlock);
  }, [selectedEntryId, blockScrolling]);

  useEffect(() => {
    const TIMEOUT_MS = inputValue.length === 0 ? 0 : 400;
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
            {filteredData.length > 0 ? (
              filteredData.map((d, i) => {
                const entryData = (d as Fuse.FuseResult<Data>).item ? (d as Fuse.FuseResult<Data>).item : (d as Data);
                return (
                  <motion.div
                    layout
                    key={entryData.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * (i + 1) } }}
                    exit={{ opacity: 0 }}
                    className={styles.entry}
                    style={{ "--clr-card-accent": getAccentForClass(entryData.class) } as any}
                    layoutId={`container_${entryData.id}`}
                    onClick={() => setSelectedEntryId(entryData.id)}
                  >
                    <motion.p
                      layout={selectedEntryId ? true : "position"}
                      layoutId={`title_${entryData.id}`}
                      className={styles.entry__title}
                      style={{ display: "block" }}
                    >
                      {entryData.id}
                    </motion.p>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                className={styles.no_results}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="no-results"
              >
                <h1>No Results</h1>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <AnimatePresence>
          {selectedEntryId && (
            <>
              <Overlay
                onClick={(_e) => {
                  setSelectedEntryId(null);
                }}
              />
              <motion.div
                style={
                  {
                    "--clr-card-accent": getAccentForClass((selectedObject as Data).class),
                  } as any
                }
                className={styles.expanded}
                layout
                layoutId={`container_${selectedEntryId}`}
              >
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.25 } }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  onClick={() => setSelectedEntryId(null)}
                  className={styles.expanded__close}
                >
                  <Close />
                </motion.button>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.25 } }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  className={styles.expanded__subheading}
                >
                  title
                </motion.div>
                <motion.p layout className={styles.expanded__title} layoutId={`title_${selectedEntryId}`}>
                  {selectedObject?.id}
                </motion.p>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1, transition: { delay: 0.5, damping: 20 } }}
                  exit={{ opacity: 0, transition: { duration: 0.05 } }}
                  className={styles.expanded__underline}
                ></motion.div>
                <motion.p
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nesciunt at temporibus ullam aperiam alias
                  fugiat itaque. Dicta commodi adipisci officia.
                </motion.p>
                <motion.div className={styles.expanded__buttons}>
                  <Link passHref={true} href={`${selectedObject?.id}/card`}>
                    <motion.a
                      key={selectedObject?.id}
                      whileHover={{ y: -6 }}
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    >
                      <Cards />
                      Cards
                    </motion.a>
                  </Link>

                  <Link passHref={true} href={`${selectedObject?.id}/list`}>
                    <motion.a
                      key={selectedObject?.id}
                      whileHover={{ y: -6 }}
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      data-new-tag
                    >
                      <List />
                      List
                    </motion.a>
                  </Link>
                  <Link passHref={true} href={`${selectedObject?.id}/spelling`}>
                    <motion.a
                      key={selectedObject?.id}
                      whileHover={{ y: -6 }}
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      data-new-tag
                    >
                      <Edit />
                      Spelling
                    </motion.a>
                  </Link>
                </motion.div>
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
