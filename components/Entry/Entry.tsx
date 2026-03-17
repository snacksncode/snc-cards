import { getAccentForClass, getHumanReadableClass, groupBy } from "@lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { Category, Danger, Edit, NoteText } from "@components/icons";
import Link from "next/link";
import { FC, PropsWithChildren, useState } from "react";
import type { Topic } from "@/types";

interface Props {
  data: Topic;
  animationDelay: number;
  isExpanded: boolean;
  onToggle: (slug: string) => void;
}

const Tag: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="relative text-[var(--clr-card-accent)] text-[0.7rem] bg-black/20 px-[1.125em] py-[0.375em] font-medium rounded">
      {children}
    </div>
  );
};

const Entry = ({
  data: { title, slug, questions, class: classString },
  animationDelay,
  isExpanded,
  onToggle,
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasDups = questions
    ? Object.values(groupBy(questions, (q) => q.question)).some((v) => v.length > 1)
    : false;

  return (
    <motion.button
      layout
      key={slug}
      initial={{ y: -25, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: animationDelay } }}
      exit={{ opacity: 0 }}
      className="flex border-none font-[inherit] flex-col justify-center rounded shadow-[0_4px_15px_rgba(0,0,0,0.1)] bg-bg-400 overflow-hidden p-8 cursor-pointer outline-transparent relative focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[var(--clr-card-accent)] focus-visible:outline-offset-2"
      style={
        {
          "--clr-card-accent": getAccentForClass(classString),
        } as React.CSSProperties
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onToggle(slug)}
    >
      <motion.div
        layout
        key="content"
        className="w-full flex justify-between items-start gap-4"
      >
        <div>
          <motion.p
            layout
            className="m-0 text-text tracking-[4px] text-left text-[0.65rem] font-medium"
          >
            TOPIC
          </motion.p>
          <motion.h1
            layout
            className="m-0 text-[1.375rem] text-[var(--clr-card-accent)] font-bold overflow-hidden text-ellipsis text-left focus:outline-none line-clamp-2"
          >
            {title}
          </motion.h1>
        </div>
        <motion.div layout className="flex flex-wrap justify-end gap-2">
          <Tag>{getHumanReadableClass(classString)}</Tag>
          <Tag>
            {questions?.length} {questions.length > 1 ? "cards" : "card"}
            {hasDups && (
              <motion.span
                layout
                key="dups"
                className="absolute -top-2 -right-2 flex items-center justify-center text-accent-yellow"
              >
                <Danger size="1rem" color="currentColor" />
              </motion.span>
            )}
          </Tag>
        </motion.div>
      </motion.div>

      <motion.div
        layout
        initial={{
          left: "calc(50% - 0.75rem)",
          bottom: 0,
          y: 90,
          position: "absolute",
        }}
        animate={{ y: isExpanded ? 90 : isHovered ? 50 : 90 }}
        key="indicator"
        className="w-6 h-20 rounded-full bg-bg-500 flex justify-center pt-1 [&_svg]:w-4 [&_svg]:h-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="var(--clr-card-accent)"
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
          />
        </svg>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            layout
            key="additional-content"
            style={{ width: "100%", overflow: "hidden" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", transition: { delay: 0.15, ease: "circOut", duration: 0.3 } }}
            exit={{ opacity: 0, height: 0, transition: { ease: "circOut", duration: 0.3 } }}
          >
            <div className="flex flex-wrap items-center justify-center mt-4 gap-6">
              <Link
                onClick={(e) => e.stopPropagation()}
                className="flex flex-1 py-3 px-8 rounded-md text-base items-center justify-center relative gap-2 font-bold bg-bg-500 text-[var(--clr-card-accent)] [&_svg]:w-6 shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-shadow duration-250 focus:outline-none focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[var(--clr-card-accent)] focus-visible:outline-offset-2"
                href={`${slug}/card`}
              >
                <Category size={32} color="currentColor" />
                Cards
              </Link>
              <Link
                onClick={(e) => e.stopPropagation()}
                className="flex flex-1 py-3 px-8 rounded-md text-base items-center justify-center relative gap-2 font-bold bg-bg-500 text-[var(--clr-card-accent)] [&_svg]:w-6 shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-shadow duration-250 focus:outline-none focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[var(--clr-card-accent)] focus-visible:outline-offset-2"
                href={`${slug}/spelling`}
              >
                <Edit size={32} color="currentColor" />
                Spelling
              </Link>
              <Link
                onClick={(e) => e.stopPropagation()}
                className="flex flex-1 py-3 px-8 rounded-md text-base items-center justify-center relative gap-2 font-bold bg-bg-500 text-[var(--clr-card-accent)] [&_svg]:w-6 shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-shadow duration-250 focus:outline-none focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[var(--clr-card-accent)] focus-visible:outline-offset-2"
                href={`${slug}/list`}
              >
                <NoteText size={32} color="currentColor" />
                List
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default Entry;
