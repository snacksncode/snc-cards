import React from "react";
import styles from "./Front.module.scss";

interface Props {
  data: string;
}

const Front = ({ data }: Props) => {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Question</h1>
      <p className={styles.text}>{data}</p>
    </div>
  );
};

export default Front;
