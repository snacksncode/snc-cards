import classNames from "classnames";
import { MessageQuestion, ArrowRotateRight, ArrowCircleDown2 } from "iconsax-react";
import { AnimateSharedLayout, motion, AnimatePresence } from "framer-motion";
import FormattedData from "@components/FormattedData";
import styles from "./EndCard.module.scss";
import { FC, useState } from "react";

interface Props {
  onRestart: () => void;
  correct: QuestionData[];
  incorrect: QuestionData[];
  amount: number;
  dataClass?: ClassString;
}

const EndCard: FC<Props> = ({ amount, correct, incorrect, onRestart, dataClass }) => {
  const [isReviewOpened, setIsReviewOpened] = useState(false);
  const score = (((amount - incorrect.length) / amount) * 100).toFixed(1);
  const handleRestart = () => {
    setIsReviewOpened(false);
    onRestart();
  };
  return (
    <AnimateSharedLayout>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        key="endcard"
        layout="position"
        className={styles.wrapper}
      >
        <h1 className={styles.wrapper__title}>
          Your end score was <span>{score}%</span>
        </h1>
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
          {isReviewOpened && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.showdown}
            >
              {incorrect.length > 0 && (
                <div>
                  <h2 className={styles.title__incorrect}>Incorrect Answers ({incorrect.length})</h2>
                  <div className={classNames(styles.list, styles.incorrect)}>
                    {incorrect.map((a) => {
                      const { answer, question } = a;
                      return (
                        <div className={styles.list__item} key={`${question}-${answer}`}>
                          <div className={styles.question}>{question}</div>
                          <div className={styles.spacer}></div>
                          <ArrowCircleDown2 size="32" variant="Bold" />
                          <FormattedData className={styles.answer} type={dataClass} data={answer} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {correct.length > 0 && (
                <div>
                  <h2 className={styles.title__correct}>Correct Answers ({correct.length})</h2>
                  <div className={classNames(styles.list, styles.correct)}>
                    {correct.map((a) => {
                      const { answer, question } = a;
                      return (
                        <div className={styles.list__item} key={`${question}-${answer}`}>
                          <div className={styles.question}>{question}</div>
                          <div className={styles.spacer}></div>
                          <ArrowCircleDown2 size="32" variant="Bold" />
                          <FormattedData className={styles.answer} type={dataClass} data={answer} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimateSharedLayout>
  );
};

export default EndCard;
