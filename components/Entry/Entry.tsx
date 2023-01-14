import getAccentForClass from "@utils/getAccentForClass";
import getHumanReadableClass from "@utils/getHumanReadableClass";
import groupBy from "@utils/groupBy";
import { AnimatePresence, motion } from "framer-motion";
import { Category, Danger, Edit, NoteText } from "iconsax-react";
import Link from "next/link";
import { FC, KeyboardEventHandler, PropsWithChildren, useEffect, useRef, useState } from "react";
import { useHover } from "usehooks-ts";
import styles from "./Entry.module.scss";

interface Props {
  data: Card;
  animationDelay: number;
}

const Tag: FC<PropsWithChildren> = ({ children }) => {
  return <div className={styles.tag}>{children}</div>;
};

const Entry = ({
  data: {
    attributes: { title, slug, questions, class: classString },
  },
  animationDelay,
}: Props) => {
  const [dupsData, setDupsData] = useState<Question[][]>();
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHovered = useHover(containerRef);

  const handleKeypress: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const target = e.target as HTMLDivElement;
      target.click();
      target.blur();
    }
  };

  useEffect(() => {
    if (!questions) return;
    const grouped = groupBy(questions, (q) => q.question);
    const values = Object.values(grouped);
    const dups = values.filter((v) => v.length > 1);
    if (dups.length > 0) setDupsData(dups);
  }, [questions]);

  return (
    <motion.div
      layout
      key={slug}
      ref={containerRef}
      onKeyPress={handleKeypress}
      initial={{ y: -25, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: animationDelay } }}
      exit={{ opacity: 0 }}
      className={styles.container}
      style={{ "--clr-card-accent": getAccentForClass(classString) } as any}
      onClick={(e) => {
        e.stopPropagation();
        return setIsExpanded((a) => !a);
      }}
    >
      <motion.div
        key="content"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}
      >
        <div>
          <motion.p layout className={styles.bang}>
            TOPIC
          </motion.p>
          <motion.h1 layout className={styles.title}>
            {title}
          </motion.h1>
        </div>
        <motion.div layout className={styles.tags}>
          <Tag>{getHumanReadableClass(classString)}</Tag>
          <Tag>
            {questions?.length} {questions.length > 1 ? "cards" : "card"}
            {dupsData && (
              <motion.span layout key="dups" className={styles.dupWarningIcon}>
                <Danger size="1rem" color="currentColor" variant="Bold" />
              </motion.span>
            )}
          </Tag>
        </motion.div>
      </motion.div>

      <motion.div
        layout
        initial={{ left: "calc(50% - 0.75rem)", bottom: 0, y: 90, position: "absolute" }}
        animate={{ y: isHovered || isExpanded ? 50 : 90 }}
        key="indicator"
        className={styles.indicator}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="var(--clr-card-accent)"
        >
          <motion.path
            initial={{ rotate: 0 }}
            animate={{ rotate: isExpanded ? 180 : 0 }}
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
            initial={{ opacity: 0, paddingBottom: "1.5rem" }}
            animate={{ opacity: 1, transition: { delay: 0.25 } }}
            exit={{ opacity: 0, transition: { delay: 0 } }}
          >
            <div className={styles.buttons}>
              <Link
                onClick={(e) => {
                  e.stopPropagation();
                }}
                style={{ display: "flex", flex: 1 }}
                href={`${slug}/card`}
              >
                <Category size="32" color="currentColor" variant="Bold" />
                Cards
              </Link>
              <Link
                onClick={(e) => {
                  e.stopPropagation();
                }}
                style={{ display: "flex", flex: 1 }}
                href={`${slug}/spelling`}
              >
                <Edit size="32" color="currentColor" variant="Bold" />
                Spelling
              </Link>
              <Link
                onClick={(e) => {
                  e.stopPropagation();
                }}
                style={{ display: "flex", flex: 1 }}
                href={`${slug}/list`}
              >
                <NoteText size="32" color="currentColor" variant="Bold" />
                List
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Entry;
