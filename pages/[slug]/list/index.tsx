import React, { useEffect, useRef, useState } from "react";
import styles from "@styles/List.module.scss";
import classNames from "classnames";
import getAccentForClass from "@utils/getAccentForClass";
import { GetStaticPropsContext } from "next";
import groupBy from "@utils/groupBy";
import { ArrowCircleDown2, ArrowCircleRight2, Back, Danger } from "iconsax-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
  data: Card;
}

export default function CardId({
  data: {
    attributes: { questions, title, class: classString },
  },
}: Props) {
  const headerRef = useRef<HTMLHeadingElement | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [dupsData, setDupsData] = useState<Question[][]>();

  const topContainerClasses = classNames(styles["top__container"], {
    [`${styles["top__container--sticky"]}`]: isSticky,
  });

  useEffect(() => {
    if (!questions) return;
    const grouped = groupBy(questions, (q) => q.question);
    const values = Object.values(grouped);
    const dups = values.filter((v) => v.length > 1);
    if (dups.length > 0) setDupsData(dups);
  }, [questions]);

  useEffect(() => {
    const cachedRef = headerRef.current;
    if (cachedRef == null) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(entry.intersectionRatio < 1);
      },
      { threshold: [1], rootMargin: "0px 100% 0px 100%" }
    );

    observer.observe(cachedRef);
    return () => {
      observer.unobserve(cachedRef);
    };
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.container}
        style={{ margin: "2rem auto 0", ["--clr-accent" as any]: getAccentForClass(classString) }}
      >
        <div>
          <Link className={styles.backButton} href="/">
            <>
              <Back variant="Outline" size="1.125rem" color="currentColor" />
              Go Back
            </>
          </Link>
        </div>
        <h1 className={styles.title}>
          List view for <br />
          <span>
            {title}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1, transition: { delay: 0.3 } }}
              className={styles.line}
            />
          </span>
        </h1>
      </motion.div>
      {dupsData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.3 } }}
          className={classNames(styles.container, styles.dupWarning)}
        >
          <h1>
            <Danger size="32" color="currentColor" variant="Bold" />
            Duplicates found in this dataset
          </h1>
          <p>Please combine them into one for a better learning experience by using e.x. a comma</p>
          <h3>List of duplicates</h3>
          <ol>
            {dupsData.map((dup) => {
              return <li key={dup[0].question}>{dup[0].question}</li>;
            })}
          </ol>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.3 } }}
        ref={headerRef}
        className={topContainerClasses}
        style={{ ["--clr-accent" as any]: getAccentForClass(classString) }}
      >
        <div className={styles.container}>
          <header className={styles.top}>
            <p>Question</p>
            <ArrowCircleRight2 size="32" color="currentColor" variant="Bold" />
            <p>Answer</p>
          </header>
        </div>
      </motion.div>
      <div className={styles.container} style={{ ["--clr-accent" as any]: getAccentForClass(classString) }}>
        <div className={styles.list}>
          {questions.map((d, index) => {
            let { answer, question } = d;
            return (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.05 * index + 0.3 } }}
                className={styles.list__item}
                key={`${question}-${answer}`}
              >
                <div className={styles.question}>{question}</div>
                <div className={styles.spacer}></div>
                <ArrowCircleDown2 size="32" color="var(--clr-accent)" variant="Bold" />
                <div className={styles.answer}>
                  <span>{answer}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const apiData = await fetch(`${process.env.API_URL}/cards?filters[slug][$eq]=${params?.slug}&populate=questions`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
      "content-type": "application/json",
    },
  });
  let dataArray: ApiResponse = await apiData.json();

  if (!dataArray.data.length) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const rawData = dataArray.data[0];
  return {
    props: {
      data: rawData,
    },
    revalidate: 60,
  };
};

export async function getStaticPaths() {
  const rawData = await fetch(`${process.env.API_URL}/cards`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
      "content-type": "application/json",
    },
  });
  let data: ApiResponse = await rawData.json();

  const paths = data.data.map((d) => {
    return {
      params: { slug: d.attributes.slug },
    };
  });

  return { paths, fallback: "blocking" };
}
