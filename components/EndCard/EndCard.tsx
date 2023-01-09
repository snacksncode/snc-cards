import classNames from "classnames";
import { MessageQuestion, ArrowRotateRight, Back } from "iconsax-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import styles from "./EndCard.module.scss";
import { FC, useState } from "react";
import EndCardReview from "@components/EndCardReview";
import getStreakEmojis from "@utils/getStreakEmojis";
import Link from "next/link";

interface Props {
  onRestart: (newData: Question[] | null) => void;
  mode: "spelling" | "cards";
  data: CardsReviewData | SpellingReviewData;
  amount: number;
  dataClass: ClassString;
  streak: number;
}

const isSpellingData = (input: Question[] | SpellingData[]): input is SpellingData[] => {
  if ("data" in input[0]) {
    return true;
  }
  return false;
};

const EndCard: FC<Props> = ({ amount, data, onRestart, mode, dataClass, streak }) => {
  const [isReviewOpened, setIsReviewOpened] = useState(false);
  const score = (((amount - data.incorrect.length) / amount) * 100).toFixed(1);
  const handleRestart = (newData: Question[] | SpellingData[] | null = null) => {
    setIsReviewOpened(false);
    if (newData && isSpellingData(newData)) {
      onRestart(newData.map((item) => item.data));
    } else {
      onRestart(newData);
    }
  };
  const handleRestartIncorrect = () => {
    handleRestart(data.incorrect);
  };
  const handleRestartAll = () => {
    handleRestart();
  };
  return (
    <LayoutGroup>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, height: "100%", y: 0 }}
        exit={{ opacity: 0 }}
        key="endcard"
        layout="position"
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
          <div className={styles.buttons_grid}>
            <Link href="/" className={classNames(styles.button)}>
              <>
                <Back color="currentColor" />
                Go Back
              </>
            </Link>
            <button className={classNames(styles.button, styles.orange)} onClick={() => setIsReviewOpened((s) => !s)}>
              <MessageQuestion color="currentColor" />
              Review
            </button>
            <button className={classNames(styles.button, styles.green)} onClick={handleRestartAll}>
              <ArrowRotateRight color="currentColor" />
              Restart
            </button>
            {data.incorrect.length > 0 && (
              <button className={classNames(styles.button, styles.purple)} onClick={handleRestartIncorrect}>
                <ArrowRotateRight color="currentColor" />
                Incorrect
              </button>
            )}
          </div>
        </section>
        <AnimatePresence>
          {isReviewOpened && <EndCardReview data={data} mode={mode} dataClass={dataClass} />}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
};

export default EndCard;
