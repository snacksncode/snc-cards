import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import styles from "./ListEntries.module.scss";
import Fuse from "fuse.js";
import { CloseSquare } from "iconsax-react";
import Entry from "@components/Entry";

interface Props {
  data: Card[];
  filterString: string | null;
}

type FilteredData = Fuse.FuseResult<Card>[] | Card[];

const ListEntries = ({ data, filterString }: Props) => {
  const [filteredData, setFilteredData] = useState<FilteredData>(data);
  const fuse = useRef(
    new Fuse(data, {
      keys: ["attributes.title"],
    })
  );

  useEffect(() => {
    if (!filterString) {
      setFilteredData(data);
      return;
    }
    const searchData = fuse.current.search(filterString);
    setFilteredData(searchData);
  }, [filterString, data]);

  return (
    <div className={styles.container}>
      <LayoutGroup>
        <AnimatePresence>
          {filteredData.length > 0 ? (
            filteredData.map((d, idx) => {
              const isFuseResult = Boolean((d as Fuse.FuseResult<Card>).item);
              const data = isFuseResult ? (d as Fuse.FuseResult<Card>).item : (d as Card);
              return <Entry key={data.attributes.slug} data={data} animationDelay={0.05 * (idx + 1) + 0.2} />;
            })
          ) : (
            <motion.h1
              key="nothing-found"
              className={styles.noResults}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}
              exit={{ opacity: 0 }}
            >
              <CloseSquare size="32" color="currentColor" variant="Bold" />
              No Entries
            </motion.h1>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
};

export default ListEntries;
