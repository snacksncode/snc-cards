import ExpandingBlob from "@components/ExpandingBlob";
import Watermark from "@components/Watermark";
import { MathJax } from "better-react-mathjax";
import classNames from "classnames";
import styles from "./Back.module.scss";

interface Props {
  data: string;
  isMobile: boolean | undefined;
  dataClass: ClassString;
  answeredRight: boolean | null;
  forwardAnswer: () => void;
}

function formatData(data: string, dataClass: ClassString) {
  if (dataClass === "math") {
    return (
      <div className={styles.answer__text}>
        <MathJax>{String.raw`${data}`}</MathJax>
      </div>
    );
  }
  return <div className={styles.answer__text}>{data}</div>;
}

const Back = ({ data, isMobile, dataClass, answeredRight, forwardAnswer }: Props) => {
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
      <div className={styles.textWrapper}>{formatData(data, dataClass)}</div>
    </div>
  );
};

export default Back;
