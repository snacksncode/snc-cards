import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Fuse, { type FuseResult } from "fuse.js";
import { CloseSquare } from "@components/icons";
import Entry from "@components/Entry";
import type { Topic } from "@/types";

interface Props {
  data: Topic[];
  filterString: string | null;
}

type FilteredData = FuseResult<Topic>[] | Topic[];

const ListEntries = ({ data, filterString }: Props) => {
  const [filteredData, setFilteredData] = useState<FilteredData>(data);
  const fuse = useRef(
    new Fuse(data, {
      keys: ["title"],
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
    <div className="grid mt-6 gap-6 flex-1 grid-cols-1 auto-rows-min relative">
      <LayoutGroup>
        <AnimatePresence>
          {filteredData.length > 0 ? (
            filteredData.map((d, idx) => {
              const isFuseResult = Boolean(
                (d as FuseResult<Topic>).item
              );
              const topic = isFuseResult
                ? (d as FuseResult<Topic>).item
                : (d as Topic);
              return (
                <Entry
                  key={topic.slug}
                  data={topic}
                  animationDelay={0.05 * (idx + 1) + 0.2}
                />
              );
            })
          ) : (
            <motion.h1
              key="nothing-found"
              className="w-full h-fit py-12 absolute text-center flex flex-col gap-4 items-center justify-center text-accent-red brightness-125 [&_svg]:w-12 [&_svg]:h-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}
              exit={{ opacity: 0 }}
            >
              <CloseSquare size={32} color="currentColor" />
              No Entries
            </motion.h1>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
};

export default ListEntries;
