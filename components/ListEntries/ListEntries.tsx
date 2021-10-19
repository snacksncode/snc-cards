import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import styles from "./ListEntries.module.scss";
import Fuse from "fuse.js";
import EntryCollapsed from "@components/EntryCollapsed";
import Overlay from "@components/Overlay";
import EntryExpanded from "@components/EntryExpanded";
import { IEntry, IEntryFields } from "contentful-types";
import Close from "icons/Close";

interface Props {
  entries: IEntry[];
  filterString: string | null;
}
type FilteredData = Fuse.FuseResult<IEntry>[] | IEntry[];

const ListEntries = ({ entries, filterString }: Props) => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<FilteredData>(entries);
  const fuse = useRef(
    new Fuse(entries, {
      keys: [
        {
          name: "fields.title",
          weight: 0.5,
        },
      ],
    })
  );

  const selectEntry = (id: string | null) => {
    setSelectedEntryId(id);
  };

  useEffect(() => {
    const shouldBlock = selectedEntryId == null ? false : true;
    document.body.classList.toggle("no-scroll", shouldBlock);
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [selectedEntryId]);

  useEffect(() => {
    if (!filterString) {
      setFilteredData(entries);
      return;
    }
    const data = fuse.current.search(filterString);
    setFilteredData(data);
  }, [filterString, entries]);

  return (
    <AnimateSharedLayout type="crossfade">
      {/* Each element */}
      <motion.div className={styles.container}>
        <AnimatePresence>
          {filteredData.length > 0 ? (
            filteredData.map((d, idx) => {
              const isFuseResult = Boolean((d as Fuse.FuseResult<IEntry>).item);
              const entryData = isFuseResult ? (d as Fuse.FuseResult<IEntry>).item : (d as IEntry);
              return (
                <EntryCollapsed
                  key={entryData.fields.slug}
                  entry={entryData.fields}
                  onSelect={selectEntry}
                  entryIndex={idx}
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
              <Close />
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
              entry={entries.find((d) => d.fields.slug === selectedEntryId)?.fields as IEntryFields}
              selectEntry={selectEntry}
              selectedId={selectedEntryId}
              key={`expanded_${selectedEntryId}`}
            />
          </>
        )}
      </AnimatePresence>
    </AnimateSharedLayout>
  );
};

export default ListEntries;
