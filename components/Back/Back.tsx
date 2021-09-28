import React from "react";
import styles from "./Back.module.scss";

interface Props {
  data: string;
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

function formatData(data: string) {
  return <div className={styles.answer__text}>{data}</div>;
}

const Back = ({ data }: Props) => {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Answer</h1>
      {formatData(data)}
    </div>
  );
};

export default Back;
