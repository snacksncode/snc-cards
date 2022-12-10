import classNames from "classnames";
import { motion } from "framer-motion";
import { ArrowCircleDown2 } from "iconsax-react";
import { FC } from "react";
import styles from "./EndCardReview.module.scss";

interface Props {
  mode: "spelling" | "cards";
  data: CardsReviewData | SpellingReviewData;
  dataClass: ClassString;
}

const EndCardList: FC<{
  dataClass: ClassString;
  data: Question | SpellingData;
  mode: "spelling" | "cards";
}> = ({ data, mode }) => {
  if (mode === "cards") {
    const { answer, question } = data as Question;
    return (
      <div className={styles.list__item}>
        <div className={styles.question}>{question}</div>
        <div className={styles.spacer}></div>
        <ArrowCircleDown2 color="currentColor" size="32" variant="Bold" />
        <div className={styles.answer}>{answer}</div>
      </div>
    );
  }
  const {
    data: { answer, question },
    expected,
    input,
  } = data as SpellingData;
  return (
    <div className={styles.list__item}>
      <div className={styles.question}>
        <small className={styles.small_question}>{question}</small>
        <div className={styles.spelling_question}>
          {expected !== answer ? (
            <span>
              {expected} <small>( {answer} )</small>
            </span>
          ) : (
            expected
          )}
        </div>
      </div>
      <div className={styles.spacer}></div>
      <ArrowCircleDown2 color="currentColor" size="32" variant="Bold" />
      <div>
        <small className={styles.typed}>You typed</small>
        <div className={styles.answer}>{input}</div>
      </div>
    </div>
  );
};

const EndCardReview: FC<Props> = ({ mode, data, dataClass }) => {
  const { incorrect, correct } = data;
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.showdown}>
      {incorrect.length > 0 && (
        <div>
          <h2 className={styles.title__incorrect}>Incorrect Answers ({incorrect.length})</h2>
          <div className={classNames(styles.list, styles.incorrect)}>
            {incorrect.map((answerData, answerIdx) => {
              return (
                <EndCardList
                  data={answerData}
                  dataClass={dataClass}
                  mode={mode}
                  key={`${JSON.stringify(answerData)}_${answerIdx}`}
                />
              );
            })}
          </div>
        </div>
      )}
      {correct.length > 0 && (
        <div>
          <h2 className={styles.title__correct}>Correct Answers ({correct.length})</h2>
          <div className={classNames(styles.list, styles.correct)}>
            {correct.map((answerData, answerIdx) => {
              return (
                <EndCardList
                  data={answerData}
                  dataClass={dataClass}
                  mode={mode}
                  key={`${JSON.stringify(answerData)}_${answerIdx}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default EndCardReview;
