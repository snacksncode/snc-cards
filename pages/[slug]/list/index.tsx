import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import styles from "@styles/List.module.scss";
import classNames from "classnames";
import getAccentForClass from "@utils/getAccentForClass";
import ArrowRightCircle from "icons/ArrowRightCircle";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { createClient, EntryCollection } from "contentful";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { IEntryFields } from "contentful-types";

const FormatedData = ({ data, type }: { data: string; type: IEntryFields["class"] }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <div className={styles.answer}>
        {type !== "math" ? (
          <span>{data}</span>
        ) : (
          <>
            {!loaded && <span>Loading...</span>}
            <span style={{ display: loaded ? "block" : "none", fontSize: "1.5rem" }}>
              <MathJax onInitTypeset={() => setLoaded(true)}>{String.raw`${data}`}</MathJax>
            </span>
          </>
        )}
      </div>
    </>
  );
};

const DataWrapper = ({ type, children }: PropsWithChildren<{ type: IEntryFields["class"] }>) => {
  if (type === "math")
    return (
      <MathJaxContext config={{ options: { enableMenu: false } }} hideUntilTypeset={"first"}>
        {children}
      </MathJaxContext>
    );
  return <>{children}</>;
};

export default function CardId({ data }: InferGetStaticPropsType<typeof getStaticProps>) {
  const headerRef = useRef<HTMLHeadingElement | null>(null);
  const [isSticky, setIsSticky] = useState(false);

  const topContainerClasses = classNames(styles["top__container"], {
    [`${styles["top__container--sticky"]}`]: isSticky,
  });

  useEffect(() => {
    const cachedRef = headerRef.current;
    if (cachedRef == null) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(entry.intersectionRatio < 1);
      },
      { threshold: [1] }
    );

    observer.observe(cachedRef);
    return () => {
      observer.unobserve(cachedRef);
    };
  }, []);
  return (
    <DataWrapper type={data.class}>
      <div
        className={styles.container}
        style={{ margin: "2rem auto 0", ["--clr-accent" as any]: getAccentForClass(data.class) }}
      >
        <h1 className={styles.title}>
          List view for <br />
          <span>{data.title}</span>
        </h1>
      </div>
      <div
        ref={headerRef}
        className={topContainerClasses}
        style={{ ["--clr-accent" as any]: getAccentForClass(data.class) }}
      >
        <div className={styles.container}>
          <header className={styles.top}>
            <p>Question</p>
            <ArrowRightCircle />
            <p>Answer</p>
          </header>
        </div>
      </div>
      <div className={styles.container} style={{ ["--clr-accent" as any]: getAccentForClass(data.class) }}>
        <div className={styles.list}>
          {data.data.map((d) => {
            let { answer, question } = d.fields;
            return (
              <div className={styles.list__item} key={`${question}-${answer}`}>
                <div className={styles.question}>{question}</div>
                <div className={styles.spacer}></div>
                <ArrowRightCircle />
                <FormatedData type={data.class} data={answer} />
              </div>
            );
          })}
        </div>
      </div>
    </DataWrapper>
  );
}

const client = createClient({
  space: process.env.CF_SPACE_ID || "",
  accessToken: process.env.CF_ACCESS_TOKEN || "",
});

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const { items } = (await client.getEntries({
    content_type: "entryData",
    "fields.slug": params?.slug,
  })) as EntryCollection<IEntryFields>;
  const data = items[0].fields;
  return {
    props: {
      data: data,
    },
  };
};

export async function getStaticPaths() {
  const res = (await client.getEntries({
    content_type: "entryData",
  })) as EntryCollection<IEntryFields>;

  const paths = res.items.map((i) => {
    return {
      params: { slug: i.fields.slug },
    };
  });

  return { paths, fallback: false };
}
