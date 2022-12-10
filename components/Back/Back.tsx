import ExpandingBlob from "@components/ExpandingBlob";
import Watermark from "@components/Watermark";
import classNames from "classnames";
import styles from "./Back.module.scss";

interface Props {
  data: string;
  isMobile: boolean | undefined;
  dataClass: ClassString;
  answeredRight: boolean | null;
  forwardAnswer: () => void;
}

const Back = ({ data, isMobile, answeredRight, forwardAnswer }: Props) => {
  const wrapperClasses = classNames(styles.wrapper, {
    [`${styles["wrapper--mobile"]}`]: isMobile,
    [`${styles["wrapper--correct"]}`]: answeredRight === true,
    [`${styles["wrapper--wrong"]}`]: answeredRight === false,
  });
  return (
    <div className={wrapperClasses}>
      {answeredRight != null && (
        <ExpandingBlob type={answeredRight === true ? "correct" : "wrong"} onAnimationComplete={forwardAnswer} />
      )}
      <Watermark size="lg" text="answer" />
      <div className={styles.textWrapper}>
        <div className={styles.answer__text}>{data}</div>
      </div>
    </div>
  );
};

export default Back;
