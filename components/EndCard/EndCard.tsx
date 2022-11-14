import classNames from "classnames";
import { MessageQuestion, ArrowRotateRight } from "iconsax-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import styles from "./EndCard.module.scss";
import { FC, useState } from "react";
import EndCardReview from "@components/EndCardReview";
import getStreakEmojis from "@utils/getStreakEmojis";

interface Props {
  onRestart: () => void;
  mode: "spelling" | "cards";
  data: CardsReviewData | SpellingReviewData;
  amount: number;
  dataClass: ClassString;
  streak: number;
}

const EndCard: FC<Props> = ({ amount, data, onRestart, mode, dataClass, streak }) => {
  const [isReviewOpened, setIsReviewOpened] = useState(false);
  const score = (((amount - data.incorrect.length) / amount) * 100).toFixed(1);
  const handleRestart = () => {
    setIsReviewOpened(false);
    onRestart();
  };
  return (
    <LayoutGroup>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, height: "100%", y: 0 }}
        exit={{ opacity: 0 }}
        key="endcard"
        layout
        className={styles.wrapper}
      >
        <h1 className={styles.wrapper__title}>
          Your end score was <span>{score}%</span>
        </h1>
        {streak >= 5 && (
          <h3>
            Highest streak: {streak}
            {getStreakEmojis(streak)}
          </h3>
        )}
        <section className={styles.buttons}>
          <h5>
            <span>What&apos;s next?</span>
          </h5>
          <button className={classNames(styles.button, styles.orange)} onClick={() => setIsReviewOpened((s) => !s)}>
            <MessageQuestion color="currentColor" variant="Bold" />
            Review Answers
          </button>
          <button className={styles.button} onClick={handleRestart}>
            <ArrowRotateRight color="currentColor" variant="Bold" />
            Restart
          </button>
        </section>
        <AnimatePresence>
          {isReviewOpened && <EndCardReview data={data} mode={mode} dataClass={dataClass} />}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
};

export default EndCard;
