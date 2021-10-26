import { FC } from "react";
import styles from "./FlipCardWatermark.module.scss";

const FlipCardWatermark: FC<{ text: string }> = ({ text }) => {
  return (
    <div className={styles.wrapper} data-text={text}>
      {text}
    </div>
  );
};

export default FlipCardWatermark;
