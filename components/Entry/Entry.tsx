import { getAccentForClass, getHumanReadableClass, groupBy } from "@lib/utils";
import { db } from "@lib/storage";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "motion/react";
import { Category, Danger, Edit, NoteText } from "@components/icons";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FC, PropsWithChildren, useState } from "react";

const ScoreChart = dynamic(() => import("./ScoreChart"), { ssr: false, loading: () => null });
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

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none ${checked ? 'bg-[var(--clr-card-accent)]' : 'bg-bg-600'}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
    />
  </button>
);

const Entry = ({
  data: { title, slug, questions, class: classString },
  animationDelay,
  isExpanded,
  onToggle,
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const [reverseCards, setReverseCards] = useState(false);
  const [reverseSpelling, setReverseSpelling] = useState(false);
  const hasDups = questions
    ? Object.values(groupBy(questions, (q) => q.question)).some((v) => v.length > 1)
    : false;

  const scoreHistory = useLiveQuery(() => db.history.where('slug').equals(slug).toArray(), [slug]) ?? [];
  const savedSession = useLiveQuery(
    () => isExpanded ? db.sessions.get(slug) : undefined,
    [slug, isExpanded]
  );

  const buildUrl = (mode: 'card' | 'spelling', reverse: boolean, resume: boolean) => {
    const params = new URLSearchParams();
    if (reverse) params.set('dir', 'reverse');
    if (resume) params.set('resume', '1');
    const query = params.toString();
    return query ? `${slug}/${mode}?${query}` : `${slug}/${mode}`;
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      layout
      key={slug}
      initial={{ y: -25, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: animationDelay } }}
      exit={{ opacity: 0 }}

      className="flex border-none font-[inherit] flex-col justify-center rounded bg-bg-400 overflow-hidden p-6 cursor-pointer outline-transparent relative focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[var(--clr-card-accent)] focus-visible:outline-offset-2 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--clr-card-accent)_20%,transparent),_0_4px_24px_color-mix(in_srgb,var(--clr-card-accent)_8%,transparent)] transition-shadow duration-300"
      style={
        {
          "--clr-card-accent": getAccentForClass(classString),
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        } as React.CSSProperties
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onToggle(slug)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(slug); }}
    >
      <motion.div
        layout
        key="content"
        className="w-full flex justify-between items-start gap-4"
      >
        <div>
          <motion.p
            layout
            className="m-0 text-text tracking-[0.1em] text-left text-[0.65rem] font-medium"
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
        className="w-6 h-20 rounded-full bg-[var(--clr-card-accent)]/10 flex justify-center pt-1 [&_svg]:w-4 [&_svg]:h-4"
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
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-bg-500 rounded-lg p-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <Category size={24} color="var(--clr-card-accent)" />
                  <span className="font-semibold text-[var(--clr-card-accent)]">Cards</span>
                </div>
                <div className="flex-1 min-w-0" />
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>Reverse</span>
                  <Toggle checked={reverseCards} onChange={setReverseCards} />
                </div>
                {savedSession?.mode === 'cards' ? (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Link
                      href={buildUrl('card', reverseCards, true)}
                      className="px-3 py-1.5 rounded bg-[var(--clr-card-accent)] text-bg-300 text-sm font-semibold hover:opacity-90 transition-opacity text-center"
                    >
                      Resume ({savedSession.currentIndex}/{questions.length})
                    </Link>
                    <Link
                      href={buildUrl('card', reverseCards, false)}
                      className="px-3 py-1.5 rounded border border-bg-600 text-text-muted text-sm hover:text-text hover:border-text-muted transition-colors text-center"
                    >
                      New
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={buildUrl('card', reverseCards, false)}
                    className="px-4 py-1.5 rounded bg-[var(--clr-card-accent)] text-bg-300 text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto text-center"
                  >
                    Start
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-bg-500 rounded-lg p-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <Edit size={24} color="var(--clr-card-accent)" />
                  <span className="font-semibold text-[var(--clr-card-accent)]">Spelling</span>
                </div>
                <div className="flex-1 min-w-0" />
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>Reverse</span>
                  <Toggle checked={reverseSpelling} onChange={setReverseSpelling} />
                </div>
                {savedSession?.mode === 'spelling' ? (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Link
                      href={buildUrl('spelling', reverseSpelling, true)}
                      className="px-3 py-1.5 rounded bg-[var(--clr-card-accent)] text-bg-300 text-sm font-semibold hover:opacity-90 transition-opacity text-center"
                    >
                      Resume ({savedSession.currentIndex}/{questions.length})
                    </Link>
                    <Link
                      href={buildUrl('spelling', reverseSpelling, false)}
                      className="px-3 py-1.5 rounded border border-bg-600 text-text-muted text-sm hover:text-text hover:border-text-muted transition-colors text-center"
                    >
                      New
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={buildUrl('spelling', reverseSpelling, false)}
                    className="px-4 py-1.5 rounded bg-[var(--clr-card-accent)] text-bg-300 text-sm font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto text-center"
                  >
                    Start
                  </Link>
                )}
              </div>

              <Link
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 bg-bg-500 rounded-lg p-3 text-[var(--clr-card-accent)] font-semibold hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-shadow"
                href={`${slug}/list`}
              >
                <NoteText size={24} color="currentColor" />
                List
              </Link>
            </div>

            {scoreHistory.length > 0 && (
              <div className="mt-4 rounded-md bg-bg-500 p-3 [&_svg]:outline-none" onClick={(e) => e.stopPropagation()}>
                <p className="text-[0.65rem] tracking-[0.08em] text-text-muted font-medium mb-2">SCORE HISTORY</p>
                <ScoreChart data={scoreHistory.map((h, i) => ({ i: i + 1, score: h.score }))} stroke={getAccentForClass(classString)} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Entry;
