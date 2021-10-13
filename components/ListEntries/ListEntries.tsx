import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import styles from "./ListEntries.module.scss";
import Fuse from "fuse.js";
import EntryCollapsed from "@components/EntryCollapsed";
import Overlay from "@components/Overlay";
import EntryExpanded from "@components/EntryExpanded";

interface Props {
  dataArray: Data[];
  filterString: string | null;
}
type FilteredData = Fuse.FuseResult<Data>[] | Data[];

const ListEntries = ({ dataArray, filterString }: Props) => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<FilteredData>(dataArray);
  const fuse = useRef(
    new Fuse(dataArray, {
      keys: [
        {
          name: "title",
          weight: 0.5,
        },
        {
          name: "tags",
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
      setFilteredData(dataArray);
      return;
    }
    const data = fuse.current.search(filterString);
    setFilteredData(data);
  }, [filterString, dataArray]);

  return (
    <AnimateSharedLayout type="crossfade">
      {/* Each element */}
      <motion.div className={styles.container}>
        <AnimatePresence>
          {filteredData.map((d, idx) => {
            const isFuseResult = Boolean((d as Fuse.FuseResult<Data>).item);
            const entryData = isFuseResult ? (d as Fuse.FuseResult<Data>).item : (d as Data);
            return (
              <EntryCollapsed
                key={entryData.id}
                data={entryData}
                onSelect={selectEntry}
                entryIndex={idx}
                selectedId={selectedEntryId}
              />
            );
          })}
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
              data={dataArray.find((d) => d.id === selectedEntryId) as Data}
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
