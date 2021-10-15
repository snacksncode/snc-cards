import React from "react";
import { getData } from "@data/exporter";
import styles from "@styles/List.module.scss";
interface Props {
  data: any[];
}

export default function CardId({ data }: Props) {
  return (
    <div className={styles.container}>
      <header className={styles.top}>
        <p>Question</p>
        <p>Answer</p>
      </header>
      <div className={styles.list}>
        {data.map((d) => {
          return (
            <div className={styles.list__item} key={`${d.question}-${d.answer}`}>
              <div className={styles.question}>{d.question}</div>
              <div className={styles.answer}>{d.answer}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  const paths = (await getData()).map((d) => ({
    params: { id: d.id },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: any) {
  const data = (await getData()).find((d) => d.id === params.id)?.data;
  return {
    props: { data: data },
  };
}
