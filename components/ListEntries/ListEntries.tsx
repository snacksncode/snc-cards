import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
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
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const fuse = useRef(
    new Fuse(data, {
      keys: ["title"],
    })
  );

  const filteredData: FilteredData = filterString ? fuse.current.search(filterString) : data;

  const handleToggle = (slug: string) => {
    setExpandedSlug((prev) => (prev === slug ? null : slug));
  };

  return (
    <div className="grid mt-6 gap-6 flex-1 grid-cols-1 auto-rows-min relative">
      <AnimatePresence mode="popLayout">
          {filteredData.length > 0 ? (
            filteredData.map((d) => {
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
                  isExpanded={expandedSlug === topic.slug}
                  onToggle={handleToggle}
                />
              );
            })
          ) : (
            <motion.h1
              key="nothing-found"
              className="w-full h-fit py-12 absolute text-center flex flex-col gap-4 items-center justify-center text-accent-red brightness-125 [&_svg]:w-12 [&_svg]:h-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CloseSquare size={32} color="currentColor" />
              No Entries
            </motion.h1>
          )}
        </AnimatePresence>
    </div>
  );
};

export default ListEntries;
