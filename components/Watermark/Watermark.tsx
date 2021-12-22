import { FC } from "react";
import styles from "./Watermark.module.scss";

const Watermark: FC<{ text: string; size: "lg" | "md" }> = ({ text, size }) => {
  const getFontSize = (size: "lg" | "md") => {
    if (size === "lg") return "8rem";
    else if (size === "md") return "6rem";
  };
  return (
    <div
      className={styles.wrapper}
      style={{
        fontSize: getFontSize(size),
      }}
      data-text={text}
    >
      {text}
    </div>
  );
};

export default Watermark;
