import { motion } from "motion/react";
import { ChangeEventHandler, useEffect, useMemo, useRef } from "react";

interface Props {
  value: string;
  onChangeHandler: ChangeEventHandler<HTMLInputElement>;
}

const Filter = ({ value, onChangeHandler }: Props) => {
  const inputRef = useRef<null | HTMLInputElement>(null);
  const isMac = useMemo(
    () =>
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad|iPod/.test(navigator.platform),
    []
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, []);

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
    >
      <label
        htmlFor="search"
        className="block cursor-pointer text-lg font-medium mb-2"
      >
        Filter topics
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id="search"
          type="text"
          placeholder="Search for title"
          value={value}
          onChange={onChangeHandler}
          className="w-full text-base bg-bg-400 border-2 border-bg-600 rounded px-4 py-3 shadow-[0_4px_10px_rgba(0,0,0,0.1)] text-text font-medium tracking-wide focus:outline-none focus:border-accent-blue"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: value.length === 0 ? 1 : 0 }}
          className="hidden sm:flex absolute top-1/2 right-4 gap-2 -translate-y-1/2"
        >
          <div className="bg-bg-500 rounded-sm px-2 py-1 text-xs font-bold text-text-muted shadow-[0_3px_0px_var(--color-bg-300)]">
            {isMac ? "\u2318" : "Ctrl"}
          </div>
          <div className="bg-bg-500 rounded-sm px-2 py-1 text-xs font-bold text-text-muted shadow-[0_3px_0px_var(--color-bg-300)]">
            K
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Filter;
