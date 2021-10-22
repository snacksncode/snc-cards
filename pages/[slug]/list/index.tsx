import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import styles from "@styles/List.module.scss";
import classNames from "classnames";
import getAccentForClass from "@utils/getAccentForClass";
import ArrowRightCircle from "icons/ArrowRightCircle";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { GetStaticPropsContext } from "next";

interface Props {
  data: APIData | null;
}

const FormatedData = ({ data, type }: { data: string; type: ClassString }) => {
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

const DataWrapper = ({ type, children }: PropsWithChildren<{ type: ClassString }>) => {
  if (type === "math")
    return (
      <MathJaxContext config={{ options: { enableMenu: false } }} hideUntilTypeset={"first"}>
        {children}
      </MathJaxContext>
    );
  return <>{children}</>;
};

export default function CardId({ data }: Props) {
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

  if (!data) return <div>Building...</div>;
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
          {data.questionData.map((d) => {
            let { answer, question } = d;
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

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  const apiData = await fetch(`${apiUrl}/entries?slug=${params?.slug}`);
  let dataArray: APIData[] = await apiData.json();

  if (!dataArray.length) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const rawData = dataArray[0];
  return {
    props: {
      data: rawData,
    },
    revalidate: 60,
  };
};

export async function getStaticPaths() {
  const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  const rawData = await fetch(`${apiUrl}/entries`);
  let data: APIData[] = await rawData.json();

  const paths = data.map((d) => {
    return {
      params: { slug: d.slug },
    };
  });

  return { paths, fallback: true };
}
