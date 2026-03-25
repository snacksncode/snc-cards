import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import uFuzzy from "@leeoniya/ufuzzy";
import { CloseSquare } from "@components/icons";
import Entry from "@components/Entry";
import AddTopicCard from "@components/AddTopicCard/AddTopicCard";
import type { Topic } from "@/types";

interface Props {
  data: Topic[];
  filterString: string | null;
}

const ListEntries = ({ data, filterString }: Props) => {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const uf = useRef(new uFuzzy({ intraMode: 1 }));
  const haystack = useMemo(() => data.map((t) => t.title), [data]);

  const filteredData: Topic[] = useMemo(() => {
    if (!filterString) return data;
    const [idxs] = uf.current.search(haystack, filterString);
    if (!idxs) return [];
    return idxs.map((i) => data[i]);
  }, [data, filterString, haystack]);

  const handleToggle = (slug: string) => {
    setExpandedSlug((prev) => (prev === slug ? null : slug));
  };

  return (
    <div className="grid mt-6 gap-6 flex-1 grid-cols-1 auto-rows-min relative">
      <AnimatePresence mode="popLayout" initial={false}>
          {filteredData.length > 0 ? (
            <>
              {filteredData.map((topic) => (
                <Entry
                  key={topic.slug}
                  data={topic}
                  isExpanded={expandedSlug === topic.slug}
                  onToggle={handleToggle}
                />
              ))}
              {!filterString && (
                <motion.div
                  key="add-topic"
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AddTopicCard />
                </motion.div>
              )}
            </>
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
