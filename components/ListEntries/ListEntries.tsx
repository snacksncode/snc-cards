import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import styles from "./ListEntries.module.scss";
import Fuse from "fuse.js";
import EntryCollapsed from "@components/EntryCollapsed";
import Overlay from "@components/Overlay";
import EntryExpanded from "@components/EntryExpanded";
import { CloseSquare } from "iconsax-react";

interface Props {
  entries: APIData[];
  filterString: string | null;
}
type FilteredData = Fuse.FuseResult<APIData>[] | APIData[];

const ListEntries = ({ entries, filterString }: Props) => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<FilteredData>(entries);
  const isFirstRender = useRef(true);
  const fuse = useRef(
    new Fuse(entries, {
      keys: ["title", "slug", "class"],
    })
  );

  const selectEntry = (id: string | null) => {
    setSelectedEntryId(id);
  };

  useEffect(() => {
    if (isFirstRender.current === true) isFirstRender.current = false;
  });

  useEffect(() => {
    if (!filterString) {
      setFilteredData(entries);
      return;
    }
    const data = fuse.current.search(filterString);
    setFilteredData(data);
  }, [filterString, entries]);

  return (
    <>
      {/* Each element */}
      <motion.div className={styles.container}>
        <AnimatePresence>
          {filteredData.length > 0 ? (
            filteredData.map((d, idx) => {
              const isFuseResult = Boolean((d as Fuse.FuseResult<APIData>).item);
              const entryData = isFuseResult ? (d as Fuse.FuseResult<APIData>).item : (d as APIData);
              return (
                <EntryCollapsed
                  key={entryData.slug}
                  entry={entryData}
                  onSelect={selectEntry}
                  entryDelay={isFirstRender.current ? 0.05 * (idx + 1) + 0.4 : 0.05 * (idx + 1) + 0.2}
                  selectedId={selectedEntryId}
                />
              );
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
      </motion.div>

      {/* Expanded */}
      <AnimatePresence>
        {selectedEntryId && (
          <>
            <Overlay
              onClick={(_e) => {
                setSelectedEntryId(null);
              }}
            />
            <EntryExpanded
              entry={entries.find((d) => d.slug === selectedEntryId) as APIData}
              selectEntry={selectEntry}
              key={`expanded_${selectedEntryId}`}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ListEntries;
