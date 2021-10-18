import { MathJax } from "better-react-mathjax";
import classNames from "classnames";
import { IEntryFields } from "contentful-types";
import React from "react";
import styles from "./Back.module.scss";

interface Props {
  data: string;
  isMobile: boolean | undefined;
  dataClass: IEntryFields["class"];
}

// function formatData(data: string) {
//   const [present, past, perfect] = data.split(" | ");
//   return (
//     <div className={styles.answer}>
//       <div className={styles.answer__entry}>
//         <p className={styles.answer__label}>Present</p>
//         <p className={styles.answer__text}>{present}</p>
//       </div>
//       <div className={styles.answer__entry}>
//         <p className={styles.answer__label}>Past</p>
//         <p className={styles.answer__text}>{past}</p>
//       </div>
//       <div className={styles.answer__entry}>
//         <p className={styles.answer__label}>Perfect</p>
//         <p className={styles.answer__text}>{perfect}</p>
//       </div>
//     </div>
//   );
// }

function formatData(data: string, dataClass: IEntryFields["class"]) {
  if (dataClass === "math") {
    return (
      <div className={styles.answer__text}>
        <MathJax>{String.raw`${data}`}</MathJax>
      </div>
    );
  }
  return <div className={styles.answer__text}>{data}</div>;
}

const Back = ({ data, isMobile, dataClass }: Props) => {
  const wrapperClasses = classNames(styles.wrapper, {
    [`${styles["wrapper--mobile"]}`]: isMobile,
  });
  return <div className={wrapperClasses}>{formatData(data, dataClass)}</div>;
};

export default Back;
