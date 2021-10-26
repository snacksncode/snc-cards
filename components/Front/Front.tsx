import FlipCardWatermark from "@components/FlipCardWatermark";
import classNames from "classnames";
import React from "react";
import styles from "./Front.module.scss";

interface Props {
  data: string;
  isMobile: boolean | undefined;
}

const Front = ({ data, isMobile }: Props) => {
  const textWrapperClasses = classNames(styles.textWrapper, {
    [`${styles["textWrapper--mobile"]}`]: isMobile,
  });
  return (
    <div className={styles.wrapper}>
      <FlipCardWatermark text="question" />
      <div className={textWrapperClasses}>
        <p className={styles.text}>{data}</p>
      </div>
    </div>
  );
};

export default Front;
